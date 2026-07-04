<script setup lang="ts">
const userStore = useUserStore();

const { data, refresh } = await useAsyncData('tasks', async () => {
    const [status, todo] = await Promise.all([
        $fetch('/api/todo/status'),
        $fetch('/api/todo', {
            query: {
                userId: userStore.user?.id,
            },
        }),
    ]);

    return { status, todo };
});
</script>

<template>
    <UDashboardPanel
        id="todo"
        :ui="{ body: 'lg:py-12' }"
    >
        <template #header>
            <UDashboardNavbar title="Tasks" />

            <UDashboardToolbar class="py-6">
                <template #left>
                    <CurrentDate />
                </template>
            </UDashboardToolbar>
        </template>

        <template #body>
            <!--            <section class="grid gap-8">-->
            <!--                <div class="flex items-center justify-between">-->
            <!--                    <CurrentDate />-->
            <!--                    <TodoAddNew @refresh="refresh" />-->
            <!--                </div>-->
            <!--                <TodoItemByStatus-->
            <!--                    :todos="data?.todo"-->
            <!--                    :status="data?.status"-->
            <!--                    @refresh="refresh"-->
            <!--                />-->
            <!--            </section>-->
        </template>
    </UDashboardPanel>
</template>
