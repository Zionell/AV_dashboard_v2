<script setup lang="ts">
import { useTimerStore } from '~/store/timer';
import { formatDateTime } from '~/utils/dateTimeUtils';

const session = useAuth();

const onSave = async (times: number) => {
	try {
		isLoading.value = true;
		const date = formatDateTime(String(new Date()), '$d.$m.$y');
		const month = new Date().getMonth() + 1;
		await $fetch('/api/times', {
			method: 'POST',
			body: {
				times,
				date,
				month,
				userId: session.data.value?.user?.id || '',
			},
		});
	}
	catch (e) {
		console.warn('StartSession/ onSave: ', e);
	}
	finally {
		isLoading.value = false;
	}
};

const store = useTimerStore();
const isLoading = ref<boolean>(false);

const changeSessionStatus = () => {
	store.setIsStarted(!store.getIsStarted);

	if (store.getIsStarted) {
		localStorage.setItem('timerStartedAt', String(new Date().getTime()));
	}
	else {
		const timeNow = new Date().getTime();
		const timerStartedAt = localStorage.getItem('timerStartedAt') || 0;
		const diff = timeNow - Number(timerStartedAt);
		onSave(diff);
		localStorage.removeItem('timerStartedAt');
	}
};

onMounted(() => {
	const timerStartedAt = localStorage.getItem('timerStartedAt');
	if (timerStartedAt) {
		store.setIsStarted(true);
	}
});
</script>

<template>
	<BlockWrapper>
		<div class="flex items-center justify-between gap-4 min-w-52">
			<transition
				name="rotate"
				mode="out-in"
			>
				<div :key="`title_${store.getIsStarted}`">
					{{
						store.getIsStarted
							? "Закончить сессию"
							: "Начать сессию"
					}}
				</div>
			</transition>
			<UButton
				size="xl"
				color="orange"
				square
				variant="solid"
				:loading="isLoading"
				@click="changeSessionStatus"
			>
				<template #trailing>
					<transition
						name="rotate"
						mode="out-in"
					>
						<svgo-stop
							v-if="store.getIsStarted"
							class="w-4 h-4"
						/>
						<svgo-play
							v-else
							class="w-4 h-4"
						/>
					</transition>
				</template>
			</UButton>
		</div>
	</BlockWrapper>
</template>
