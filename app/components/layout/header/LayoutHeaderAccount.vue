<script setup lang="ts">
const { getSession } = useAuth();
const { user } = await getSession();
const { signOut } = useAuth();

const items = [
	[
		{
			label: 'Sign out',
			click: () => {
				signOut();
			},
		},
	],
];

const userImage = computed((): string => {
	return user?.image || '/images/avatar.png';
});
</script>

<template>
	<UDropdown
		:items="items"
		:ui="{ item: { disabled: 'cursor-text select-text' } }"
		:popper="{ placement: 'bottom-start' }"
	>
		<div class="flex items-center">
			<div class="text-right">
				<h6>
					{{ user?.name }}
				</h6>
				<div class="text-xs text-zinc-400">
					{{ user?.email }}
				</div>
			</div>
			<UAvatar
				class="ml-4"
				size="md"
				:src="userImage"
				alt="Avatar"
			/>
		</div>

		<template #item="{ item }">
			<span class="truncate">{{ item.label }}</span>

			<svgo-logout class="flex-shrink-0 h-4 w-4 ms-auto" />
		</template>
	</UDropdown>
</template>
