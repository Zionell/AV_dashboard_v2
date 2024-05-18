<script setup lang="ts">
import { getJWTPayload } from '~/utils/utils';

definePageMeta({
	auth: false,
	layout: 'empty',
});

const { query } = useRoute();
const router = useRouter();
const companyId = ref<string>('');
const error = ref<string>('');
const timer = ref<ReturnType<typeof setTimeout> | null>(null);

const checkQuery = async () => {
	try {
		const q = query.q;
		const jwtPayload = await getJWTPayload(q);
		if (jwtPayload.payload) {
			companyId.value = String(jwtPayload.payload);
			redirectIfValid();
		}
	}
	catch (e) {
		error.value = 'Ссылка не действительна';
	}
};
const redirectIfValid = (): void => {
	router.push({
		path: `/auth/registration`,
		query: {
			q: companyId.value,
		},
	});
};

onMounted(async () => {
	if (timer.value) {
		clearTimeout(timer.value);
	}

	timer.value = setTimeout(() => checkQuery(), 500);
});
</script>

<template>
	<section>
		<transition
			name="fade"
			mode="out-in"
		>
			<div v-if="error">
				{{ error }}
			</div>
			<div
				v-else
				class="font-black text-2xl"
			>
				Проверяем ссылку-приглашение
				<Preloader class="mt-6" />
			</div>
		</transition>
	</section>
</template>
