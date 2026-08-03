<script setup lang="ts">
definePageMeta({
    // Создание проекта — только owner/manager.
    middleware: [
        function () {
            const userStore = useUserStore();

            if (!userStore.canManageContent) {
                return navigateTo(ERoutes.PROJECTS);
            }
        },
    ],
});
</script>

<template>
    <UDashboardPanel
        id="projectNew"
        :ui="{ body: 'lg:py-12' }"
    >
        <template #header>
            <UDashboardNavbar title="New project">
                <template #leading>
                    <UButton
                        leading-icon="i-lucide-arrow-left"
                        variant="ghost"
                        color="neutral"
                        :to="ERoutes.PROJECTS"
                    />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <div class="w-full max-w-3xl mx-auto">
                <ProjectForm />
            </div>
        </template>
    </UDashboardPanel>
</template>
