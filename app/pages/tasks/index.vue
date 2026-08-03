<script setup lang="ts">
import type { ETodoStatus } from '#shared/types/times';
import type { ETaskPriority, ITaskCard, TaskSortKey } from '#shared/types/todo';

const userStore = useUserStore();

const modalRef = useTemplateRef('modalRef');

const listTake = 20;
const page = ref(1);
const q = ref('');
const projectId = ref<string | undefined>();
const executorId = ref<string | undefined>();
const authorId = ref<string | undefined>();
const priority = ref<ETaskPriority | undefined>();
const sort = ref<TaskSortKey>('newest');
const view = ref<'list' | 'kanban'>('kanban');

// Kanban показывает все задачи разом, list — постранично.
const take = computed(() => (view.value === 'kanban' ? 200 : listTake));
const skip = computed(() => (view.value === 'kanban' ? 0 : listTake * (page.value - 1)));

// Смена фильтров сбрасывает страницу.
watch([q, projectId, executorId, authorId, priority, sort, view], () => {
    page.value = 1;
});

const { data, refresh } = await useFetch<{ results: ITaskCard[]; count: number }>('/api/todo', {
    query: {
        q,
        projectId,
        executorId,
        authorId,
        priority,
        sort,
        take,
        skip,
    },
});

const tasks = computed((): ITaskCard[] => data.value?.results || []);

// Деталка: после refresh подтягиваем свежую версию открытой задачи.
const isDetailOpen = ref(false);
const selectedId = ref<string | null>(null);
const selectedTask = computed(() => tasks.value.find((t) => t.id === selectedId.value) || null);

function openDetail(task: ITaskCard) {
    selectedId.value = task.id;
    isDetailOpen.value = true;
}

function handleCreate(status?: ETodoStatus) {
    modalRef.value?.open(status);
}

function handleEdit(task: ITaskCard) {
    modalRef.value?.openEdit(task);
}
</script>

<template>
    <UDashboardPanel
        id="tasks"
        :ui="{ body: 'lg:py-12' }"
    >
        <template #header>
            <UDashboardNavbar title="Tasks">
                <template #right>
                    <UButton
                        v-if="userStore.canManageContent"
                        icon="i-lucide-plus"
                        label="Create Task"
                        @click="handleCreate()"
                    />
                </template>
            </UDashboardNavbar>

            <UDashboardToolbar class="py-6">
                <template #left>
                    <CurrentDate />
                </template>
            </UDashboardToolbar>
        </template>

        <template #body>
            <section class="grid gap-6">
                <UInput
                    v-model="q"
                    icon="i-lucide-search"
                    placeholder="Search tasks..."
                    class="w-full"
                    size="lg"
                />

                <TasksFilters
                    v-model:project-id="projectId"
                    v-model:executor-id="executorId"
                    v-model:author-id="authorId"
                    v-model:priority="priority"
                    v-model:sort="sort"
                    v-model:view="view"
                />

                <TasksKanban
                    v-if="view === 'kanban'"
                    :tasks="tasks"
                    :can-create="userStore.canManageContent"
                    @open="openDetail"
                    @create="handleCreate"
                    @refresh="refresh"
                />

                <template v-else>
                    <TasksList
                        v-if="tasks.length"
                        :tasks="tasks"
                        @open="openDetail"
                    />
                    <UEmpty
                        v-else
                        variant="subtle"
                        icon="i-lucide-clipboard-list"
                        title="No tasks found"
                        description="It looks like there are no tasks yet. Create one to get started."
                        :actions="
                            userStore.canManageContent
                                ? [
                                      {
                                          icon: 'i-lucide-plus',
                                          label: 'Create Task',
                                          onClick: () => handleCreate(),
                                      },
                                  ]
                                : []
                        "
                    />

                    <div
                        v-if="(data?.count || 0) > listTake"
                        class="flex justify-center"
                    >
                        <UPagination
                            v-model:page="page"
                            :total="data?.count || 0"
                            :items-per-page="listTake"
                        />
                    </div>
                </template>
            </section>

            <TaskDetailSlideover
                v-model:open="isDetailOpen"
                :task="selectedTask"
                @refresh="refresh"
                @edit="handleEdit"
            />

            <TaskFormModal
                v-if="userStore.canManageContent"
                ref="modalRef"
                @refresh="refresh"
            />
        </template>
    </UDashboardPanel>
</template>
