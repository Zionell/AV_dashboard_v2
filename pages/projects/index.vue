<script
    setup
    lang="ts"
>
definePageMeta({
	pageTransition: {
		name: 'rotate'
	}
})

import { useUserStore } from '~/store/user';

const userStore = useUserStore();

const { data, refresh } = await useAsyncData(async () => {
	const [projects] = await Promise.all([
		$fetch('/api/projects', {
			query: {
				userId: userStore.getUserId,
			},
		}),
	]);

	return { projects };
});
</script>

<template>
	<section class="grid gap-8">
		<div class="flex items-center justify-between">
			<CurrentDate />
			<ProjectAddNew
				@refresh="refresh"
			/>
		</div>
		<ul class="grid grid-cols-3 gap-7">
			<li
				v-for="project in data?.projects"
				:key="project.id"
			>
				<ProjectCard
					:project="project"
					@refresh="refresh"
				/>
			</li>
		</ul>
	</section>
</template>
