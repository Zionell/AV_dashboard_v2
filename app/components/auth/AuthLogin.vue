<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui/dist/runtime/types";
import { z } from "zod";

const schema = z.object({
	email: z.string().email("Невалидный email"),
	password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
});

type Schema = z.output<typeof schema>;

const state = reactive({
	email: undefined,
	password: undefined,
});
const isLoading = ref<boolean>(false);
const errorMsg = ref<string>("");

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
	try {
		isLoading.value = true;
		const { email, password } = event.data;
		console.log("email, password", { email, password });
		// const res = await signIn("credentials", {
		// 	email,
		// 	password,
		// 	redirect: false,
		// });
		// if (res?.error) {
		// 	throw new Error(res?.error);
		// } else {
		// 	router.push("/");
		// }
	} catch (error) {
		isLoading.value = false;
		console.error("AuthLoginForm / onSubmit: ", error);
		errorMsg.value = error?.message;
	}
};
</script>

<template>
	<UForm
		:schema="schema"
		:state="state"
		class="w-full space-y-4"
		@submit="onSubmit"
	>
		<UFormField required label="Email" name="email">
			<UInput v-model="state.email" class="w-full" size="lg" />
		</UFormField>

		<UFormField required label="Пароль" name="password">
			<UInput
				v-model="state.password"
				class="w-full"
				type="password"
				size="lg"
			/>
		</UFormField>

		<transition>
			<div v-if="errorMsg" class="text-sm text-red-700">
				{{ errorMsg }}
			</div>
		</transition>

		<UButton size="lg" block type="submit" :loading="isLoading">
			Войти
		</UButton>
	</UForm>
</template>
