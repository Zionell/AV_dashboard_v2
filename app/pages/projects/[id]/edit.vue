<script setup lang="ts">
import type { IProjectDetail } from '#shared/types/projects';

definePageMeta({
    // Редактирование — только owner/manager (менеджер — в рамках своих проектов, это отсекает API).
    middleware: [
        function () {
            const userStore = useUserStore();

            if (!userStore.canManageContent) {
                return navigateTo(ERoutes.PROJECTS);
            }
        },
    ],
});

const route = useRoute();

const { data: project, error } = await useFetch<IProjectDetail>(`/api/projects/${route.params.id}`);

if (error.value || !project.value) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found' });
}
</script>

<template>
    <UDashboardPanel
        id="projectEdit"
        :ui="{ body: 'lg:py-12' }"
    >
        <template #header>
            <UDashboardNavbar :title="`Editing: ${project?.name}`">
                <template #leading>
                    <UButton
                        leading-icon="i-lucide-arrow-left"
                        variant="ghost"
                        color="neutral"
                        :to="`${ERoutes.PROJECTS}/${project?.id}`"
                    />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <div class="w-full max-w-3xl mx-auto">
                <ProjectForm :project="project" />
            </div>
        </template>
    </UDashboardPanel>
</template>
