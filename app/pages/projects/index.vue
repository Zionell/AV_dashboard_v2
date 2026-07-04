<script setup lang="ts">
const userStore = useUserStore();

const modalRef = useTemplateRef('modalRef');

const { data, error, status, refresh } = await useFetch('/api/projects', {
    query: {
        userId: userStore.user?.id,
    },
    key: 'projects',
});

if (error.value) {
    throw createError({
        statusCode: 404,
        statusMessage: 'Page Not Found',
    });
}

function handleAddNew() {
    modalRef.value?.open();
}
</script>

<template>
    <UDashboardPanel
        id="projects"
        :ui="{ body: 'lg:py-12' }"
    >
        <template #header>
            <UDashboardNavbar title="Projects" />

            <UDashboardToolbar class="py-6">
                <template #left>
                    <CurrentDate />
                </template>

                <template #right>
                    <AddNewProject
                        ref="modalRef"
                        @refresh="refresh"
                    />
                </template>
            </UDashboardToolbar>
        </template>

        <template #body>
            <div
                v-if="data?.results.length"
                class="grid grid-cols-2 gap-5"
            >
                <template v-if="status === 'pending'">
                    <USkeleton
                        v-for="project in data.results"
                        :key="project.id"
                        class="h-33 w-full"
                    />
                </template>
                <template v-else>
                    <ProjectCard
                        v-for="project in data.results"
                        :key="project.id"
                        :project="project"
                    />
                </template>
            </div>
            <UEmpty
                v-else
                variant="subtle"
                icon="i-lucide-file"
                title="No projects found"
                description="It looks like you haven't added any projects. Create one to get started."
                :actions="[
                    {
                        icon: 'i-lucide-plus',
                        label: 'Create new',
                        onClick: handleAddNew,
                    },
                ]"
            />
        </template>
    </UDashboardPanel>
</template>
