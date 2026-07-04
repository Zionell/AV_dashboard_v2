<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';
import { PAGES } from '~/assets/ts/pages';

const links: NavigationMenuItem[] = PAGES.settings.children;
</script>

<template>
    <UDashboardPanel
        id="settings"
        :ui="{ body: 'lg:py-12' }"
    >
        <template #header>
            <UDashboardNavbar title="Settings" />

            <UDashboardToolbar>
                <UNavigationMenu
                    :items="links"
                    highlight
                    class="-mx-1 flex-1"
                />
            </UDashboardToolbar>
        </template>

        <template #body>
            <div class="flex flex-col gap-4 w-full">
                <NuxtPage />
            </div>
        </template>
    </UDashboardPanel>
</template>
