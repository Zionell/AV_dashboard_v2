<script setup lang="ts">
import type { TimeType } from '~/types';
import { daysArrayByCurMonth } from '~/utils/dateTimeUtils';
import { useUserStore } from '~/store/user';
import { fullListMonth } from '~/assets/constants';

type ChartDataType = {
	labels: string[];
	values: number[];
};

const curMonth = ref(new Date().getMonth() + 1);
const daysInMonth = computed(() => daysArrayByCurMonth(curMonth.value));

const userStore = useUserStore();
const { data, pending, refresh } = await useAsyncData(async () => await $fetch('/api/times', {
	query: {
		userId: userStore.getUserId,
		month: curMonth.value,
	},
}));

const preparedData = computed<ChartDataType>(() => {
	const initialState: ChartDataType = {
		labels: [],
		values: [],
	};
	daysInMonth.value.forEach((d) => {
		const item = data?.value?.find((v: TimeType) => v.date === d);
		if (item) {
			const time = item._sum.times ? item._sum.times : 0;
			initialState.values.push(time);
			initialState.labels.push(item.date);
		}
		else {
			initialState.values.push(0);
			initialState.labels.push('');
		}
	});
	return initialState;
});
const isEmpty = computed(() => !preparedData.value);

const handleChange = () => {
	refresh();
};
</script>

<template>
	<section class="grid gap-8">
		<div class="flex items-center justify-between">
			<CurrentDate />
		</div>
		<div>
			<UFormGroup
				label="Диапазон дат"
				class="mb-6"
			>
				<USelect
					v-model="curMonth"
					:options="fullListMonth"
					color="orange"
					size="lg"
					@change="handleChange"
				/>
			</UFormGroup>

			<BlockWrapper
				title="График"
				:is-empty="isEmpty"
				:is-loading="pending"
			>
				<TimesheetChart
					:prepared-data="preparedData"
					:days-in-month="daysInMonth"
				/>
			</BlockWrapper>
		</div>
	</section>
</template>
