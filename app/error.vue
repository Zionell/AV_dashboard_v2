<script setup lang="ts">
import type { NuxtError } from "nuxt/app";
import { ERROR_MESSAGES } from "~/assets/ts/errors";

const props = defineProps<{
	error: NuxtError;
}>();

const status = computed(() => (props.error?.statusCode === 404 ? 404 : 500));

const textError = computed<string>(() =>
	status.value in ERROR_MESSAGES
		? ERROR_MESSAGES[status.value as keyof typeof ERROR_MESSAGES]
		: "Техническая ошибка",
);

const handleError = () => clearError({ redirect: "/" });
</script>

<template>
	<UApp>
		<section
			class="flex flex-col items-center justify-center w-full h-screen"
		>
			<h1 class="text-orange-400 errorText font-black">
				{{ status }}
			</h1>
			<h2 class="text-3xl text-orange-300">
				{{ textError }}
			</h2>

			<DevOnly>
				{{ props.error?.statusMessage }}
			</DevOnly>

			<UButton class="mt-8" @click="handleError"> На главную </UButton>
		</section>
	</UApp>
</template>
