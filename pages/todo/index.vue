<script setup lang="ts">
definePageMeta({
	pageTransition: {
		name: 'rotate'
	}
})

import { useUserStore } from '~/store/user';

const userStore = useUserStore();

const { data, refresh } = await useAsyncData(async () => {
	const [status, todo] = await Promise.all([
		$fetch('/api/todo/status'),
		$fetch('/api/todo', {
			query: {
				userId: userStore.getUserId,
			},
		}),
	]);

	return { status, todo };
});
</script>

<template>
	<section class="grid gap-8">
		<div class="flex items-center justify-between">
			<CurrentDate />
			<TodoAddNew @refresh="refresh" />
		</div>
		<TodoItemByStatus
			:todos="data?.todo"
			:status="data?.status"
			@refresh="refresh"
		/>
	</section>
</template>
