<script setup lang="ts">
import type { IPaginatedResponse } from '#shared/types';
import type { IMaterial } from '#shared/types/material';

const userStore = useUserStore();

const pageInfo = ref({
    take: 10,
    skip: 0,
});
const page = ref(1);
const category = ref();

const { data } = useFetch<IPaginatedResponse<IMaterial>>('/api/materials', {
    query: {
        companyId: userStore.user?.companyId,
        take: pageInfo.value.take,
        skip: pageInfo.value.take * (page.value - 1),
    },
});

const isHasNext = computed(() => {
    if (!data?.value?.count) {
        return false;
    }
    return data.value.count > pageInfo.value.take;
});

const cards = computed(() =>
    data.value?.results.map((item) => ({
        id: item.id,
        title: item.name,
        description: item.description,
        icon: 'i-lucide-smile',
        to: '/docs/getting-started/integrations/icons',
    }))
);
</script>

<template>
    <UDashboardPanel
        id="materials"
        :ui="{ body: 'lg:py-12' }"
    >
        <template #header>
            <UDashboardNavbar title="Materials" />

            <UDashboardToolbar class="py-6">
                <template #left>
                    <CurrentDate />
                </template>

                <template #right>
                    <USelect
                        v-model="category"
                        :items="[]"
                        :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
                        placeholder="Filter status"
                        class="min-w-28"
                    />
                </template>
            </UDashboardToolbar>
        </template>

        <template #body>
            <UPageGrid v-if="cards?.length">
                <UPageCard
                    v-for="card in cards"
                    :key="card.id"
                    v-bind="card"
                    variant="soft"
                />
            </UPageGrid>
            <UEmpty
                v-else
                variant="subtle"
                icon="i-lucide-file"
                title="No materials found"
                description="It looks like you haven't added any materials. Create one to get started."
                :actions="[
                    {
                        icon: 'i-lucide-plus',
                        label: 'Create new',
                    },
                ]"
            />
            <!--    <section class="grid gap-8">-->
            <!--        <div class="flex items-center justify-between">-->
            <!--            <CurrentDate />-->
            <!--            <MaterialsAddNew @refresh="refresh" />-->
            <!--        </div>-->
            <!--        <ul class="grid grid-cols-3 gap-7">-->
            <!--            <li-->
            <!--                v-for="item in data?.list"-->
            <!--                :key="item.id"-->
            <!--            >-->
            <!--                <MaterialsCard-->
            <!--                    :item="item"-->
            <!--                    @refresh="refresh"-->
            <!--                />-->
            <!--            </li>-->
            <!--        </ul>-->

            <!--        <div-->
            <!--            v-if="isHasNext"-->
            <!--            class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700"-->
            <!--        >-->
            <!--            <UPagination-->
            <!--                v-model="page"-->
            <!--                :page-count="pageInfo.take"-->
            <!--                :total="data?.count || 10"-->
            <!--            />-->
            <!--        </div>-->
            <!--    </section>-->
        </template>
    </UDashboardPanel>
</template>
