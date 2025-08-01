<script setup lang="ts">
import { LOGIN_CONTENT, REGISTRATION_CONTENT } from "~/assets/ts/constants";

// const { signIn } = useAuth();

const isLogin = shallowRef<boolean>(true);

// const handleLoginBy = async (provider: ProvidersType) => {
// 	try {
// 		await signIn(provider, {
// 			callbackUrl: '/',
// 		});
// 	}
// 	catch (error) {
// 		console.error('AuthPage / handleLogin: ', error);
// 	}
// };

const content = computed(() => {
	return isLogin.value ? LOGIN_CONTENT : REGISTRATION_CONTENT;
});
</script>

<template>
	<div
		class="grid gap-4 justify-items-center w-full py-5 px-7 rounded-3xl shadow-2xl"
	>
		<h2 class="text-center text-4xl font-semibold">
			{{ content.title }}
		</h2>

		<Transition name="fade" mode="out-in">
			<AuthLogin v-if="isLogin" />
			<AuthRegistration v-else />
		</Transition>

		<p>или</p>

		<UButton class="w-fit" color="warning" variant="outline" square>
			<template #leading>
				<!--				<svgo-google class="w-8 h-8" />-->
			</template>
		</UButton>

		<div class="flex flex-wrap items-center">
			{{ content.linkLabel }}
			<UButton variant="link" @click="isLogin = !isLogin">
				{{ content.linkText }}
			</UButton>
		</div>
	</div>
</template>
