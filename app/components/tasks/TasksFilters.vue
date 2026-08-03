<script setup lang="ts">
import { ETaskPriority, type TaskSortKey } from '#shared/types/todo';

const projectId = defineModel<string | undefined>('projectId');
const executorId = defineModel<string | undefined>('executorId');
const authorId = defineModel<string | undefined>('authorId');
const priority = defineModel<ETaskPriority | undefined>('priority');
const sort = defineModel<TaskSortKey>('sort', { default: 'newest' });
const view = defineModel<'list' | 'kanban'>('view', { default: 'kanban' });

const userStore = useUserStore();

const { data: projects } = await useLazyFetch('/api/projects', {
    query: { take: 50 },
});

const projectItems = computed(() => [
    { label: 'Project: All', value: undefined },
    ...(projects.value?.results || []).map((p) => ({ label: p.name, value: p.id })),
]);

// Список участников доступен только owner/manager (users/specs закрыт для employee).
const { data: users } = await useLazyFetch('/api/users/specs', {
    immediate: userStore.canManageContent,
    default: () => [],
});

const userItems = (prefix: string) =>
    computed(() => [
        { label: `${prefix}: All`, value: undefined },
        ...(users.value || []).map((u) => ({ label: u.name || u.id, value: u.id })),
    ]);

const executorItems = userItems('Assignee');
const authorItems = userItems('Author');

const priorityItems = [
    { label: 'Priority: All', value: undefined },
    { label: 'High', value: ETaskPriority.HIGH },
    { label: 'Medium', value: ETaskPriority.MEDIUM },
    { label: 'Low', value: ETaskPriority.LOW },
];

const sortItems: { label: string; value: TaskSortKey }[] = [
    { label: 'Newest', value: 'newest' },
    { label: 'Oldest', value: 'oldest' },
    { label: 'Due date', value: 'due' },
    { label: 'Priority', value: 'priority' },
];

function setView(value: 'list' | 'kanban') {
    view.value = value;
}
</script>

<template>
    <div class="flex flex-wrap items-center gap-3">
        <USelect
            v-model="projectId"
            :items="projectItems"
            placeholder="Project: All"
            class="min-w-32"
        />

        <USelect
            v-if="userStore.canManageContent"
            v-model="executorId"
            :items="executorItems"
            placeholder="Assignee: All"
            class="min-w-32"
        />

        <USelect
            v-model="priority"
            :items="priorityItems"
            placeholder="Priority: All"
            class="min-w-32"
        />

        <USelect
            v-if="userStore.canManageContent"
            v-model="authorId"
            :items="authorItems"
            placeholder="Author: All"
            class="min-w-32"
        />

        <USelect
            v-model="sort"
            :items="sortItems"
            class="min-w-36"
        />

        <UFieldGroup class="ms-auto">
            <UButton
                icon="i-lucide-list"
                label="List"
                :variant="view === 'list' ? 'solid' : 'outline'"
                color="neutral"
                @click="setView('list')"
            />
            <UButton
                icon="i-lucide-kanban"
                label="Kanban"
                :variant="view === 'kanban' ? 'solid' : 'outline'"
                color="neutral"
                @click="setView('kanban')"
            />
        </UFieldGroup>
    </div>
</template>
