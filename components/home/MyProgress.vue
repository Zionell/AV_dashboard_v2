<script setup lang="ts">
type PropsType = {
	progress: {
		allTodos: number;
		completed: number;
	};
};

const props = withDefaults(defineProps<PropsType>(), {
	progress: () => ({
		allTodos: 0,
		completed: 0,
	}),
});

const onload = computed(() => {
	return Math.ceil(props.progress.completed * 100 / props.progress.allTodos);
});
</script>

<template>
	<BlockWrapper
		title="Мой прогресс"
		:is-empty="!progress.completed"
	>
		<div class="flex items-center justify-between gap-2.5">
			<p class="text-2xl font-semibold">
				{{ onload }}%
			</p>
			<div
				class="flex items-center justify-center p-3 rounded-2xl bg-orange-50"
			>
				<svgo-progress class="w-10 h-10 text-orange-400" />
			</div>
		</div>
	</BlockWrapper>
</template>
