<script setup lang="ts">
import type { DropdownMenuItem } from "#ui/components/DropdownMenu.vue";
import { useUserStore } from "~~/store/user";

const colorMode = useColorMode();

const userStore = useUserStore();
const { signOut } = useAuth();

const user = computed(() => ({
	label: userStore.user?.name || "",
	avatar: userStore.user?.image || "",
}));

const items = computed<DropdownMenuItem[][]>(() => [
	[
		{
			label: "Appearance",
			icon: "i-lucide-sun-moon",
			children: [
				{
					label: "Light",
					icon: "i-lucide-sun",
					type: "checkbox",
					checked: colorMode.value === "light",
					onSelect(e: Event) {
						e.preventDefault();

						colorMode.preference = "light";
					},
				},
				{
					label: "Dark",
					icon: "i-lucide-moon",
					type: "checkbox",
					checked: colorMode.value === "dark",
					onSelect(e: Event) {
						e.preventDefault();

						colorMode.preference = "dark";
					},
				},
			],
		},
	],
	[
		{
			label: "Log out",
			icon: "i-lucide-log-out",
			onSelect: () => signOut(),
		},
	],
]);
</script>

<template>
	<UDropdownMenu
		:items="items"
		:content="{ align: 'center', collisionPadding: 12 }"
		:ui="{
			content: 'w-(--reka-dropdown-menu-trigger-width)',
		}"
	>
		<UButton
			trailingIcon="i-lucide-chevrons-up-down"
			color="neutral"
			variant="ghost"
			block
			class="data-[state=open]:bg-elevated"
			:ui="{
				trailingIcon: 'text-dimmed',
			}"
		>
			<template #leading>
				<UAvatar :src="user.avatar" :alt="user.label" />
			</template>
			{{ user.label }}
		</UButton>

		<template #chip-leading="{ item }">
			<span
				:style="{
					'--chip-light': `var(--color-${(item as any).chip}-500)`,
					'--chip-dark': `var(--color-${(item as any).chip}-400)`,
				}"
				class="ms-0.5 size-2 rounded-full bg-(--chip-light) dark:bg-(--chip-dark)"
			/>
		</template>
	</UDropdownMenu>
</template>
