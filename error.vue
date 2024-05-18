<script setup lang="ts">
import type { NuxtError } from 'nuxt/app';

const props = defineProps({
	error: Object as () => NuxtError,
});

const status = computed(() => props.error?.statusCode || 500);
const textError = computed<string>(
	() => props.error?.statusMessage || 'Техническая ошибка',
);

const handleError = () => clearError({ redirect: '/' });
</script>

<template>
	<section class="flex flex-col items-center justify-center w-full h-screen">
		<h1 class="text-orange-400 text-error font-black">
			{{ status }}
		</h1>
		<h2
			class="text-3xl text-orange-300"
		>
			{{ textError }}
		</h2>

		<UButton
			class="mt-8"
			color="orange"
			@click="handleError"
		>
			На главную
		</UButton>
	</section>
</template>
