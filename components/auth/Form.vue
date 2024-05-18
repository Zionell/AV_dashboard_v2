<script setup lang="ts">
import { loginContent, registrationContent } from '~/assets/constants';
import type { ProvidersType } from '~/types/auth';

const route = useRoute();
const { signIn } = useAuth();
const { slug } = route.params;

const handleLoginBy = async (provider: ProvidersType) => {
	try {
		await signIn(provider, {
			callbackUrl: '/',
		});
	}
	catch (error) {
		console.error('AuthPage / handleLogin: ', error);
	}
};

const content = computed(() => {
	return slug === 'login' ? loginContent : registrationContent;
});
</script>

<template>
	<div
		class="grid gap-4 justify-items-center w-full py-5 px-7 rounded-3xl shadow-2xl"
	>
		<h2 class="text-center text-4xl font-semibold">
			{{ content.title }}
		</h2>
		<AuthLogin v-if="slug === 'login'" />
		<AuthRegistration v-else />
		<p>или</p>
		<UButton
			class="w-fit"
			color="orange"
			variant="outline"
			square
			@click="handleLoginBy('google')"
		>
			<template #leading>
				<svgo-google class="w-8 h-8" />
			</template>
		</UButton>
		<div class="flex flex-wrap gap-1 text-lg">
			{{ content.linkLabel }}
			<ULink
				:to="content.linkValue"
				active-class="text-orange-400"
				inactive-class="text-orange-400"
			>
				{{ content.linkText }}
			</ULink>
		</div>
	</div>
</template>
