<script setup lang="ts">
definePageMeta({
    middleware: [
        function () {
            const userStore = useUserStore();

            // Демо-роль сюда не пускаем: форма ей всё равно недоступна на отправку,
            // а пустая страница создания в витрине только сбивает с толку.
            if (!userStore.canManageContent || userStore.isReadonly) {
                return navigateTo(ERoutes.MATERIALS);
            }
        },
    ],
});
</script>

<template>
    <UDashboardPanel
        id="materialNew"
        :ui="{ body: 'lg:py-12' }"
    >
        <template #header>
            <UDashboardNavbar title="New material">
                <template #leading>
                    <UButton
                        leading-icon="i-lucide-arrow-left"
                        variant="ghost"
                        color="neutral"
                        :to="ERoutes.MATERIALS"
                    />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <div class="w-full max-w-3xl mx-auto">
                <MaterialForm />
            </div>
        </template>
    </UDashboardPanel>
</template>
