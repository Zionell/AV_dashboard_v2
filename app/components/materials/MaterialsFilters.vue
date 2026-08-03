<script setup lang="ts">
import type { MaterialSortKey } from '#shared/types/material';
import { EViewType } from '#shared/types';

const categoryId = defineModel<string | undefined>('categoryId');
const projectId = defineModel<string | undefined>('projectId');
const sort = defineModel<MaterialSortKey>('sort', { default: 'newest' });
const view = defineModel<EViewType>('view', { default: EViewType.GRID });

const { data } = await useLazyAsyncData(
    'materials-filters',
    async () => {
        const headers = useRequestHeaders(['cookie']);
        const [categories, projects] = await Promise.all([
            $fetch('/api/materials/categories', { headers }),
            $fetch('/api/projects', { headers, query: { take: 50 } }),
        ]);

        return { categories, projects };
    },
    {
        default: () => ({
            categories: [],
            projects: null,
        }),
    }
);

const categories = computed(() => data.value?.categories || []);
const projects = computed(() => data.value?.projects);

const categoryItems = computed(() => [
    { label: 'Type: All', value: undefined },
    ...(categories.value || []).map((c) => ({ label: c.label, value: c.id })),
]);

const projectItems = computed(() => [
    { label: 'Project: All', value: undefined },
    ...(projects.value?.results || []).map((p) => ({ label: p.name, value: p.id })),
]);

const sortItems: { label: string; value: MaterialSortKey }[] = [
    { label: 'Newest', value: 'newest' },
    { label: 'Oldest', value: 'oldest' },
    { label: 'Recently Updated', value: 'updated' },
    { label: 'Alphabetically', value: 'alpha' },
];

function setView(value: EViewType) {
    view.value = value;
}
</script>

<template>
    <div class="flex flex-wrap items-center gap-3">
        <USelect
            v-model="categoryId"
            :items="categoryItems"
            placeholder="Type: All"
            class="min-w-32"
        />

        <USelect
            v-model="projectId"
            :items="projectItems"
            placeholder="Project: All"
            class="min-w-32"
        />

        <USelect
            v-model="sort"
            :items="sortItems"
            class="min-w-40"
        />

        <UFieldGroup class="ms-auto">
            <UButton
                icon="i-lucide-layout-grid"
                :variant="view === EViewType.GRID ? 'solid' : 'outline'"
                color="neutral"
                @click="setView(EViewType.GRID)"
            />
            <UButton
                icon="i-lucide-list"
                :variant="view === EViewType.LIST ? 'solid' : 'outline'"
                color="neutral"
                @click="setView(EViewType.LIST)"
            />
        </UFieldGroup>
    </div>
</template>
