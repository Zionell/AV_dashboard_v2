<script setup lang="ts">
import { useTimerStore } from '~/store/timer';

type TimerSessionType = {
	hour: string | number;
	min: string | number;
	sec: string | number;
	count: number;
};

const store = useTimerStore();

const timer = ref<ReturnType<typeof setInterval> | null>(null);
const timerSession = ref<TimerSessionType>({
	hour: '00',
	min: '00',
	sec: '00',
	count: 0,
});

const isStarted = storeToRefs(store);

const startTimer = () => {
	timer.value = setInterval(() => {
		timerSession.value.count++;
		timerSession.value = {
			hour: leadingZero(Math.floor(timerSession.value.count / 3600)),
			min: leadingZero(Math.floor((timerSession.value.count % 3600) / 60)),
			sec: leadingZero(Math.floor(timerSession.value.count % 60)),
			count: timerSession.value.count,
		};
	}, 1000);
};

const stopTimer = () => {
	if (timer.value) {
		clearInterval(timer.value);
		timer.value = null;
	}
	timerSession.value = {
		hour: '00',
		min: '00',
		sec: '00',
		count: 0,
	};
};
onMounted(() => {
	if (store.getIsStarted) {
		const timeNow = new Date().getTime();
		const timerStartedAt = localStorage.getItem('timerStartedAt') || 0;
		const diff = timeNow - Number(timerStartedAt);
		const initialTime = Math.floor(diff / 1000);
		timerSession.value.count = initialTime > 0 ? initialTime : 0;
		startTimer();
	}
});
watch(isStarted.getIsStarted, () => {
	if (store.getIsStarted) {
		startTimer();
	}
	else {
		stopTimer();
	}
});
</script>

<template>
	<BlockWrapper title="Время за сессию">
		<div class="flex items-center justify-between gap-2.5 mt-auto">
			<div class="font-medium text-3xl">
				{{ timerSession.hour }}:{{ timerSession.min }}:{{
					timerSession.sec
				}}
			</div>

			<div
				class="flex items-center justify-center p-3 rounded-2xl bg-orange-50"
			>
				<ClockSvg :session-status="store.getIsStarted" />
			</div>
		</div>
	</BlockWrapper>
</template>
