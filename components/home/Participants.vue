<script setup lang="ts">
import type { Role } from '@prisma/client';

type UserType = {
	id: string;
	name: string | null;
	image: string | null;
	role: Role;
};

type PropsType = {
	users: UserType[];
};

const props = withDefaults(defineProps<PropsType>(), {
	users: () => [],
});

const isEmpty = computed(() => {
	return !props.users.length;
});

const userImage = (user: UserType) => {
	return user?.image || '/images/avatar.png';
};
</script>

<template>
	<BlockWrapper
		title="Участники"
		:is-empty="isEmpty"
	>
		<div>
			<div class="grid grid-cols-[2.5rem_3fr_1fr] gap-6 text-xs">
				<p>Фото</p>
				<p>ФИО</p>
				<p>Должность</p>
			</div>
			<ul class="h-56 custom__scroll">
				<li
					v-for="user in users"
					:key="user.id"
					class="grid grid-cols-[2.5rem_3fr_1fr] gap-6 mt-4 items-center border border-orange-400 p-2 rounded-xl"
				>
					<UAvatar
						class="mr-4"
						size="md"
						:src="userImage(user)"
						alt="Avatar"
					/>

					<div class="grow">
						{{ user.name }}
					</div>
					<div>
						{{ user?.role }}
					</div>
				</li>
			</ul>
		</div>
	</BlockWrapper>
</template>
