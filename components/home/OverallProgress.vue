<script lang="ts" setup>
import type { TodoStatus } from '@prisma/client';
import { DoughnutChart, useDoughnutChart } from 'vue-chart-3';
import type { ChartData, ChartOptions } from 'chart.js';

type TodoGroupType = {
	todoStatusId: string;
	_count: {
		todoStatusId: number;
	};
};

type PropsType = {
	labels: TodoStatus[];
	values: TodoGroupType[];
};

type ChartDataType = {
	labels: string[];
	values: number[];
	bgColor: string[];
};

const props = withDefaults(defineProps<PropsType>(), {
	labels: () => [],
	values: () => [],
});

const isLoading = ref<boolean>(true);

const isEmpty = computed(() => !props.values.length);

const preparedData = computed<ChartDataType>(() => {
	const data: ChartDataType = {
		labels: [],
		values: [],
		bgColor: [],
	};
	props.labels.forEach((l) => {
		props.values.forEach((v) => {
			if (v.todoStatusId === l.id) {
				data.values.push(v._count.todoStatusId);
				data.labels.push(l.label);
				data.bgColor.push(l.color);
			}
		});
	});
	return data;
});

const chartData = computed<ChartData<'doughnut'>>(() => ({
	labels: preparedData.value.labels,
	datasets: [
		{
			data: preparedData.value.values,
			backgroundColor: preparedData.value.bgColor,
		},
	],
}));

const options = computed<ChartOptions<'doughnut'>>(() => ({
	responsive: true,
	maintainAspectRatio: false,
	plugins: {
		legend: {
			position: 'top',
			labels: {
				usePointStyle: true,
				padding: 50,
				font: {
					size: 16,
				},
			},
		},
	},
}));

const { doughnutChartProps } = useDoughnutChart({
	chartData,
	options,
});

onMounted(() => {
	isLoading.value = false;
});
</script>

<template>
	<BlockWrapper
		title="График"
		:is-empty="isEmpty"
		:is-loading="isLoading"
	>
		<DoughnutChart v-bind="doughnutChartProps" />
	</BlockWrapper>
</template>
