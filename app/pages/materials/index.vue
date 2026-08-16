<script setup lang="ts">
import { EViewType, type IPaginatedResponse } from '#shared/types';
import type { IMaterialCard, MaterialSortKey } from '#shared/types/material';

const userStore = useUserStore();
const { readonlyAttrs } = useReadonly();
const route = useRoute();

const take = 24;
const page = ref(1);
const q = ref('');
const categoryId = ref<string | undefined>();

const projectId = ref<string | undefined>(
    typeof route.query.projectId === 'string' ? route.query.projectId : undefined
);
const sort = ref<MaterialSortKey>('newest');
const view = ref<EViewType>(EViewType.GRID);

const skip = computed(() => take * (page.value - 1));

watch([q, categoryId, projectId, sort], () => {
    page.value = 1;
});

const { data } = await useFetch<IPaginatedResponse<IMaterialCard>>('/api/materials', {
    query: {
        q,
        categoryId,
        projectId,
        sort,
        take,
        skip,
    },
});

function handleCreate() {
    navigateTo(`${ERoutes.MATERIALS}/new`);
}
</script>

<template>
    <UDashboardPanel
        id="materials"
        :ui="{ body: 'lg:py-12' }"
    >
        <template #header>
            <UDashboardNavbar title="Materials">
                <template #right>
                    <UButton
                        v-if="userStore.canManageContent"
                        v-bind="readonlyAttrs"
                        icon="i-lucide-plus"
                        label="Create new"
                        @click="handleCreate"
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
                    placeholder="Search materials..."
                    class="w-full"
                    size="lg"
                />

                <MaterialsFilters
                    v-model:category-id="categoryId"
                    v-model:project-id="projectId"
                    v-model:sort="sort"
                    v-model:view="view"
                />

                <div
                    v-if="data?.results?.length"
                    :class="
                        view === EViewType.GRID ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4' : 'grid gap-2'
                    "
                >
                    <MaterialCard
                        v-for="item in data.results"
                        :key="item.id"
                        :item="item"
                        :view="view"
                    />
                </div>

                <UEmpty
                    v-else
                    variant="subtle"
                    icon="i-lucide-file"
                    title="No materials found"
                    description="It looks like you haven't added any materials. Create one to get started."
                    :actions="
                        userStore.canManageContent
                            ? [
                                  {
                                      icon: 'i-lucide-plus',
                                      label: 'Create new',
                                      onClick: handleCreate,
                                      ...readonlyAttrs,
                                  },
                              ]
                            : []
                    "
                />

                <div
                    v-if="(data?.count || 0) > take"
                    class="flex justify-center"
                >
                    <UPagination
                        v-model:page="page"
                        :total="data?.count || 0"
                        :items-per-page="take"
                    />
                </div>
            </section>
        </template>
    </UDashboardPanel>
</template>
