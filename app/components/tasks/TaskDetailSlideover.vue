<script setup lang="ts">
import { format } from 'date-fns';
import { ETodoStatus } from '#shared/types/times';
import type { ITaskCard } from '#shared/types/todo';

const props = defineProps<{
    task: ITaskCard | null;
}>();

const open = defineModel<boolean>('open', { default: false });

const emit = defineEmits<{
    refresh: [];
    edit: [task: ITaskCard];
}>();

const { $csrfFetch } = useNuxtApp();
const toast = useToast();
const userStore = useUserStore();
const { readonlyAttrs } = useReadonly();
const isRemoving = ref(false);

const statusItems = [
    { label: 'Todo', value: ETodoStatus.TODO },
    { label: 'In Progress', value: ETodoStatus.IN_PROGRESS },
    { label: 'Review', value: ETodoStatus.REVIEW },
    { label: 'Done', value: ETodoStatus.DONE },
];

// Локальный статус: смена доступна всем ролям в рамках их проектов.
const status = ref<ETodoStatus | undefined>();

watch(
    () => props.task,
    (task) => {
        status.value = task?.status;
    },
    { immediate: true }
);

async function onStatusChange(value: ETodoStatus) {
    if (!props.task || value === props.task.status) return;

    try {
        await $csrfFetch(`/api/todo?id=${props.task.id}`, {
            method: 'PUT',
            body: { status: value },
        });
        emit('refresh');
    } catch (e) {
        console.warn('TaskDetailSlideover/ onStatusChange: ', e);
        toast.add({ title: 'Failed to change status', color: 'error' });
        status.value = props.task.status;
    }
}

async function remove() {
    if (!props.task) return;

    try {
        isRemoving.value = true;

        await $csrfFetch('/api/todo', {
            method: 'DELETE',
            query: { id: props.task.id },
        });
        toast.add({ title: `Task "${props.task.name}" deleted`, color: 'success' });
        open.value = false;
        emit('refresh');
    } catch (e) {
        console.warn('TaskDetailSlideover/ remove: ', e);
        toast.add({ title: 'Failed to delete task', color: 'error' });
    } finally {
        isRemoving.value = false;
    }
}

function formatDate(value: Date | string | null) {
    return value ? format(new Date(value), 'dd MMM yyyy') : '—';
}

function handleEdit() {
    if (props.task) emit('edit', props.task);
}
</script>

<template>
    <USlideover
        v-model:open="open"
        :title="task?.name || ''"
    >
        <template #body>
            <div
                v-if="task"
                class="grid gap-6"
            >
                <div class="flex items-center gap-2">
                    <UBadge
                        v-if="task.priority"
                        :color="taskPriorityColor(task.priority)"
                        variant="subtle"
                        class="uppercase text-[10px]"
                    >
                        {{ taskPriorityLabel(task.priority) }}
                    </UBadge>
                    <UBadge
                        :color="taskStatusColor(task.status)"
                        variant="subtle"
                    >
                        {{ taskStatusLabel(task.status) }}
                    </UBadge>
                </div>

                <UFormField label="Status">
                    <USelect
                        v-model="status"
                        v-bind="readonlyAttrs"
                        :items="statusItems"
                        class="w-full"
                        @update:model-value="onStatusChange($event as ETodoStatus)"
                    />
                </UFormField>

                <dl class="grid gap-3 text-sm">
                    <div class="flex items-center justify-between gap-2">
                        <dt class="text-muted">Project</dt>
                        <dd class="font-medium">{{ task.project?.name || '—' }}</dd>
                    </div>
                    <div class="flex items-center justify-between gap-2">
                        <dt class="text-muted">Assignee</dt>
                        <dd class="flex items-center gap-2 font-medium">
                            <UAvatar
                                :src="task.executor?.image || ''"
                                :alt="task.executor?.name || ''"
                                size="2xs"
                            />
                            {{ task.executor?.name || '—' }}
                        </dd>
                    </div>
                    <div class="flex items-center justify-between gap-2">
                        <dt class="text-muted">Author</dt>
                        <dd class="font-medium">{{ task.author?.name || '—' }}</dd>
                    </div>
                    <div class="flex items-center justify-between gap-2">
                        <dt class="text-muted">Created</dt>
                        <dd class="font-medium">{{ formatDate(task.createdAt) }}</dd>
                    </div>
                    <div class="flex items-center justify-between gap-2">
                        <dt class="text-muted">Due Date</dt>
                        <dd class="font-medium">{{ formatDate(task.dueDate) }}</dd>
                    </div>
                    <div class="flex items-center justify-between gap-2">
                        <dt class="text-muted">Estimate</dt>
                        <dd class="font-medium">{{ task.estimateHours ? `${task.estimateHours}h` : '—' }}</dd>
                    </div>
                    <div class="flex items-center justify-between gap-2">
                        <dt class="text-muted">Logged</dt>
                        <dd class="font-medium">{{ task.loggedMs ? formatDuration(task.loggedMs) : '—' }}</dd>
                    </div>
                </dl>

                <div v-if="task.description">
                    <h4 class="text-sm font-semibold text-highlighted mb-1">Description</h4>
                    <p class="text-sm text-muted whitespace-pre-line">{{ task.description }}</p>
                </div>

                <USeparator />

                <TaskAttachments
                    :todo-id="task.id"
                    @changed="emit('refresh')"
                />

                <USeparator />

                <TaskComments
                    :todo-id="task.id"
                    @changed="emit('refresh')"
                />
            </div>
        </template>

        <template
            v-if="userStore.canManageContent"
            #footer
        >
            <div class="flex items-center justify-between w-full gap-3">
                <UButton
                    v-bind="readonlyAttrs"
                    label="Edit task"
                    variant="outline"
                    color="neutral"
                    icon="i-lucide-pencil"
                    @click="handleEdit"
                />
                <UButton
                    v-bind="readonlyAttrs"
                    label="Delete task"
                    color="error"
                    variant="outline"
                    icon="i-lucide-trash"
                    :loading="isRemoving"
                    @click="remove"
                />
            </div>
        </template>
    </USlideover>
</template>
