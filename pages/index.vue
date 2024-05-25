<script setup lang="ts">
definePageMeta({
	pageTransition: {
		name: 'rotate'
	}
})

import { useUserStore } from '~/store/user';

const userStore = useUserStore();

const { data } = await useAsyncData(async () => {
	const [materials, users, currentProject, todos] = await Promise.all([
		$fetch('/api/materials', {
			query: {
				companyId: userStore.getCompanyId,
				take: 15,
			},
		}),
		$fetch('/api/users', {
			query: {
				companyId: userStore.getCompanyId,
				take: 15,
			},
		}),
		$fetch('/api/projects/current', {
			query: {
				userId: userStore.getUserId,
			},
		}),
		$fetch('/api/todo', {
			query: {
				userId: userStore.getUserId,
				take: 15,
			},
		}),
	]);
	const [todosGrouped, todosStatuses, todoProgress] = await Promise.all([
		$fetch('/api/todo/group', {
			query: {
				curProjectId: currentProject?.id,
			},
		}),
		$fetch('/api/todo/status-spec', {
			query: {
				curProjectId: currentProject?.id,
			},
		}),
		$fetch('/api/todo/progress', {
			query: {
				curProjectId: currentProject?.id,
			},
		}),
	]);

	return {
		materials: materials.material,
		users,
		currentProject,
		todos,
		todosGrouped,
		todosStatuses,
		todoProgress,
	};
});
</script>

<template>
	<section class="grid gap-8">
		<div class="flex items-center justify-between">
			<CurrentDate />
			<HomeStartSession />
		</div>
		<div class="grid grid-cols-3 gap-7">
			<HomeMyProgress :progress="data?.todoProgress" />
			<HomeSessionRecording />
			<HomeCurrentProject :current-project="data?.currentProject" />
		</div>
		<div class="grid grid-cols-2 gap-7">
			<HomeMaterials :items="data?.materials" />
			<HomeOverallProgress
				:labels="data?.todosStatuses"
				:values="data?.todosGrouped"
			/>
			<HomeParticipants :users="data?.users" />
			<HomeToDo :todos="data?.todos" />
		</div>
	</section>
</template>
