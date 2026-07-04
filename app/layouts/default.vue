<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';
import { PAGES } from '~/assets/ts/pages';

const colorMode = useColorMode();
const userStore = useUserStore();
const isDark = computed(() => colorMode.value === 'dark');

const links = computed(() => {
    const linksArr: NavigationMenuItem[] = [PAGES.dashboard, PAGES.company, PAGES.settings];

    if (userStore.user?.companyId) {
        linksArr.splice(2, 0, PAGES.projects, PAGES.times, PAGES.tasks, PAGES.materials);
    }

    return linksArr;
});
</script>

<template>
    <UDashboardGroup unit="rem">
        <UDashboardSidebar
            id="default"
            class="bg-elevated/25"
            :ui="{ footer: 'lg:border-t lg:border-default' }"
        >
            <template #header>
                <ClientOnly>
                    <UIcon
                        name="i-local-logo"
                        :class="['h-auto w-3/5 mx-auto relative z-10', { 'text-white': isDark }]"
                    />
                </ClientOnly>
            </template>

            <template #default>
                <UNavigationMenu
                    :items="links"
                    orientation="vertical"
                    tooltip
                    popover
                />
            </template>

            <template #footer>
                <UserMenu />
            </template>
        </UDashboardSidebar>

        <slot />
    </UDashboardGroup>
</template>
