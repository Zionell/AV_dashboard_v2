<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui/dist/runtime/types";

const router = useRouter();
const { query } = useRoute();

const schema = z
	.object({
		email: z
			.string({ required_error: "Это поле обязательное" })
			.email("Невалидный email"),
		password: z
			.string({ required_error: "Это поле обязательное" })
			.min(6, "Пароль должен содержать минимум 6 символов"),
		name: z.string({ required_error: "Это поле обязательное" }),
		confirmPassword: z
			.string({ required_error: "Это поле обязательное" })
			.min(6, "Пароль должен содержать минимум 6 символов"),
		checkbox: z.boolean({ required_error: "Это поле обязательное" }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Пароли должны совпадать",
		path: ["confirmPassword"],
	});

type Schema = z.output<typeof schema>;

const state = reactive({
	email: undefined,
	password: undefined,
	name: undefined,
	confirmPassword: undefined,
	checkbox: undefined,
});
const isLoading = ref<boolean>(false);
const errorMsg = ref<string>("");

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
	try {
		isLoading.value = true;
		// const { email, password, name } = event.data;
		// const res = await signIn('credentials', {
		// 	email,
		// 	password,
		// 	name,
		// 	type: 'registration',
		// 	companyId: query.q,
		// 	redirect: false,
		// });
		// if (res?.error) {
		// 	throw new Error(res?.error);
		// }
		// else {
		// 	router.push('/');
		// }
	} catch (error) {
		isLoading.value = false;
		console.error("AuthRegistrationForm / onSubmit: ", error);
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
		<UFormField required label="Имя" name="name">
			<UInput
				class="w-full"
				v-model="state.name"
				color="warning"
				size="lg"
			/>
		</UFormField>

		<UFormField required label="Email" name="email">
			<UInput
				class="w-full"
				v-model="state.email"
				color="warning"
				size="lg"
			/>
		</UFormField>

		<UFormField required label="Пароль" name="password">
			<UInput
				class="w-full"
				v-model="state.password"
				type="password"
				color="warning"
				size="lg"
			/>
		</UFormField>

		<UFormField required label="Подтвердите пароль" name="confirmPassword">
			<UInput
				v-model="state.confirmPassword"
				class="w-full"
				type="password"
				color="warning"
				size="lg"
			/>
		</UFormField>

		<UFormField required name="checkbox">
			<UCheckbox
				v-model="state.checkbox"
				color="warning"
				label="Согласие на обработку данных"
			/>
		</UFormField>

		<transition>
			<div v-if="errorMsg" class="text-sm text-red-700">
				{{ errorMsg }}
			</div>
		</transition>

		<UButton
			size="lg"
			block
			color="warning"
			type="submit"
			:loading="isLoading"
		>
			Зарегистрироваться
		</UButton>
	</UForm>
</template>
