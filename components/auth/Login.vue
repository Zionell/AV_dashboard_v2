<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui/dist/runtime/types';

const router = useRouter();
const { signIn } = useAuth();

const schema = z.object({
	email: z.string().email('Невалидный email'),
	password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
});

type Schema = z.output<typeof schema>;

const state = reactive({
	email: undefined,
	password: undefined,
});
const isLoading = ref<boolean>(false);
const errorMsg = ref<string>('');

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
	try {
		isLoading.value = true;
		const { email, password } = event.data;
		const res = await signIn('credentials', {
			email,
			password,
			redirect: false,
		});
		if (res?.error) {
			throw new Error(res?.error);
		}
		else {
			router.push('/');
		}
	}
	catch (error) {
		isLoading.value = false;
		console.error('AuthLoginForm / onSubmit: ', error);
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
		<UFormGroup
			required
			label="Email"
			name="email"
		>
			<UInput
				v-model="state.email"
				color="orange"
				size="lg"
			/>
		</UFormGroup>

		<UFormGroup
			required
			label="Пароль"
			name="password"
		>
			<UInput
				v-model="state.password"
				type="password"
				color="orange"
				size="lg"
			/>
		</UFormGroup>

		<transition>
			<div
				v-if="errorMsg"
				class="text-sm text-red-700"
			>
				{{ errorMsg }}
			</div>
		</transition>

		<UButton
			size="lg"
			block
			color="orange"
			type="submit"
			:loading="isLoading"
		>
			Войти
		</UButton>
	</UForm>
</template>
