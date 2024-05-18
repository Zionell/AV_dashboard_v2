<script setup lang="ts">
defineProps({
	text: {
		type: String,
		default: 'Упс... <br> кажется тут ничего нет',
	},
});
</script>

<template>
	<div class="flex items-center justify-center w-full h-full">
		<h4
			class="font-medium text-lg text-center"
			v-html="text"
		/>
	</div>
</template>
