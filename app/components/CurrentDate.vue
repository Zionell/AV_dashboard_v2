<script setup lang="ts">
const dateTime = computed(() => {
	const date = new Date();
	return formatDateTime(String(date), '$d $e $y г.');
});
</script>

<template>
	<div>
		<div class="text-3xl font-semibold">
			Сегодня
		</div>
		<div class="font-medium text-xl">
			{{ dateTime }}
		</div>
	</div>
</template>
