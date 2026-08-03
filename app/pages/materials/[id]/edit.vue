<script setup lang="ts">
import type { IMaterialCard } from '#shared/types/material';

definePageMeta({
    middleware: [
        function () {
            const userStore = useUserStore();

            if (!userStore.canManageContent) {
                return navigateTo(ERoutes.MATERIALS);
            }
        },
    ],
});

const route = useRoute();

const { data: material, error } = await useFetch<IMaterialCard>(`/api/materials/${route.params.id}`);

if (error.value || !material.value) {
    throw createError({ statusCode: 404, statusMessage: 'Material not found' });
}
</script>

<template>
    <UDashboardPanel
        id="materialEdit"
        :ui="{ body: 'lg:py-12' }"
    >
        <template #header>
            <UDashboardNavbar :title="`Editing: ${material?.name}`">
                <template #leading>
                    <UButton
                        leading-icon="i-lucide-arrow-left"
                        variant="ghost"
                        color="neutral"
                        :to="`${ERoutes.MATERIALS}/${material?.id}`"
                    />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <div class="w-full max-w-3xl mx-auto">
                <MaterialForm :material="material" />
            </div>
        </template>
    </UDashboardPanel>
</template>
