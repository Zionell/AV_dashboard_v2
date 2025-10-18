<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === "dark");
const items: NavigationMenuItem[][] = [
	[
		{
			label: "Dashboard",
			icon: "i-lucide-house",
			to: ERoutes.DASHBOARD,
		},
		{
			label: "Settings",
			icon: "i-lucide-settings",
			defaultOpen: true,
			children: [
				{
					label: "General",
					to: ERoutes.SETTINGS,
				},
				{
					label: "Security",
					to: ERoutes.SECURITY,
				},
			],
		},
	],
];
</script>

<template>
	<UDashboardGroup unit="rem">
		<UDashboardSidebar
			id="default"
			class="bg-elevated/25"
			:ui="{ footer: 'lg:border-t lg:border-default' }"
		>
			<template #header>
				<UIcon
					name="i-local-logo"
					:class="[
						'h-auto w-3/5 relative z-10',
						{ 'text-white': isDark },
					]"
				/>
			</template>

			<template #default>
				<UNavigationMenu
					:items="items[0]"
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
