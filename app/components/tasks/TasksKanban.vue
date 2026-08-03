<script setup lang="ts">
import draggable from 'vuedraggable';
import { ETodoStatus } from '#shared/types/times';
import type { ITaskCard } from '#shared/types/todo';

const props = defineProps<{
    tasks: ITaskCard[];
    canCreate: boolean;
}>();

const emit = defineEmits<{
    refresh: [];
    open: [task: ITaskCard];
    create: [status: ETodoStatus];
}>();

const { $csrfFetch } = useNuxtApp();
const toast = useToast();

const COLUMNS = [
    { status: ETodoStatus.TODO, label: 'Todo', dot: 'bg-neutral-400' },
    { status: ETodoStatus.IN_PROGRESS, label: 'In Progress', dot: 'bg-blue-500' },
    { status: ETodoStatus.REVIEW, label: 'Review', dot: 'bg-purple-500' },
    { status: ETodoStatus.DONE, label: 'Done', dot: 'bg-green-500' },
] as const;

// Локальные копии колонок: draggable мутирует списки при переносе.
const columns = reactive<Record<ETodoStatus, ITaskCard[]>>({
    [ETodoStatus.TODO]: [],
    [ETodoStatus.IN_PROGRESS]: [],
    [ETodoStatus.REVIEW]: [],
    [ETodoStatus.DONE]: [],
});

watch(
    () => props.tasks,
    (tasks) => {
        for (const col of COLUMNS) {
            columns[col.status] = tasks.filter((t) => t.status === col.status);
        }
    },
    { immediate: true }
);

interface IDragChange {
    added?: { element: ITaskCard };
}

async function onChange(event: IDragChange, status: ETodoStatus) {
    // Интересует только перенос В колонку — он и есть смена статуса.
    if (!event.added) return;

    const task = event.added.element;

    try {
        await $csrfFetch(`/api/todo?id=${task.id}`, {
            method: 'PUT',
            body: { status },
        });
        task.status = status;
    } catch (e) {
        console.warn('TasksKanban/ onChange: ', e);
        toast.add({ title: 'Failed to change status', color: 'error' });
        emit('refresh');
    }
}
</script>

<template>
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        <div
            v-for="col in COLUMNS"
            :key="col.status"
            class="rounded-lg bg-elevated/50 ring ring-default"
        >
            <div class="flex items-center gap-2 p-3">
                <span
                    class="w-2 h-2 rounded-full"
                    :class="col.dot"
                />
                <h3 class="text-sm font-semibold text-highlighted">{{ col.label }}</h3>
                <UBadge
                    color="neutral"
                    variant="subtle"
                    size="sm"
                >
                    {{ columns[col.status].length }}
                </UBadge>

                <UButton
                    v-if="canCreate"
                    icon="i-lucide-plus"
                    variant="ghost"
                    color="neutral"
                    size="xs"
                    class="ms-auto"
                    @click="emit('create', col.status)"
                />
            </div>

            <draggable
                v-model="columns[col.status]"
                group="tasks"
                item-key="id"
                :animation="200"
                :force-fallback="true"
                ghost-class="opacity-40"
                fallback-class="rotate-2 shadow-xl"
                class="grid gap-2 p-2 pt-0 min-h-32"
                @change="onChange($event, col.status)"
            >
                <!-- div-обёртка в #item обязательна: UPageCard (корень TaskCard) не пробрасывает
                     data-draggable от vuedraggable в DOM — без неё Sortable не находит карточки.
                     Слот должен содержать ровно один узел (комментарии внутри тоже считаются). -->
                <template #item="{ element }">
                    <div>
                        <TaskCard
                            :task="element"
                            @click="emit('open', element)"
                        />
                    </div>
                </template>

                <template #footer>
                    <div
                        v-if="!columns[col.status].length"
                        class="grid place-items-center gap-2 py-8 text-center text-muted"
                    >
                        <UIcon
                            name="i-lucide-inbox"
                            class="w-8 h-8"
                        />
                        <p class="text-sm font-medium">No tasks</p>
                        <p class="text-xs">Create a new task<br />or drag one here.</p>
                        <UButton
                            v-if="canCreate"
                            label="Create Task"
                            variant="outline"
                            color="neutral"
                            size="xs"
                            @click="emit('create', col.status)"
                        />
                    </div>
                </template>
            </draggable>
        </div>
    </div>
</template>
