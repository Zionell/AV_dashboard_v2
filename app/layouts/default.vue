<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === "dark");
const open = ref(false);

const links: NavigationMenuItem[] = [
	{
		label: "Dashboard",
		icon: "i-lucide-house",
		to: ERoutes.DASHBOARD,
		onSelect: () => {
			open.value = false;
		},
	},
	{
		label: "Settings",
		to: ERoutes.SETTINGS,
		icon: "i-lucide-settings",
		defaultOpen: true,
		type: "trigger",
		children: [
			{
				label: "General",
				to: ERoutes.SETTINGS,
				exact: true,
				onSelect: () => {
					open.value = false;
				},
			},
			{
				label: "Security",
				to: ERoutes.SECURITY,
				onSelect: () => {
					open.value = false;
				},
			},
		],
	},
];
</script>

<template>
	<UDashboardGroup unit="rem">
		<UDashboardSidebar
			id="default"
			v-model:open="open"
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
