<script setup lang="ts">
import { BarChart, useBarChart } from 'vue-chart-3';
import type { ChartData, ChartOptions } from 'chart.js';
import { msToTime } from '~/utils/dateTimeUtils';

type ChartDataType = {
	labels: string[];
	values: number[];
};

type PropsType = {
	preparedData: ChartDataType;
	daysInMonth: string[];
};

const props = withDefaults(defineProps<PropsType>(), {
	preparedData: () => ({}) as ChartDataType,
	daysInMonth: () => [],
});

const chartData = computed<ChartData<'bar'>>(() => ({
	labels: props.daysInMonth,
	datasets: [
		{
			label: 'Отработано',
			data: props.preparedData.values,
			backgroundColor: '#FF6384FF',
		},
	],
}));
const options = computed<ChartOptions<'bar'>>(() => ({
	responsive: true,
	maintainAspectRatio: false,
	scales: {
		x: {
			grid: {
				display: false,
			},
		},
		y: {
			display: false,
			grid: {
				display: false,
			},
		},
	},
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
		tooltip: {
			callbacks: {
				label: (context) => {
					const { h, m, s } = msToTime(context.parsed.y);

					if (h && m) {
						return `Отработано ${h}:${m} ч`;
					}
					if (s && m) {
						return `Отработано ${m}:${s} м`;
					}

					return `Отработано ${s} с`;
				},
			},
		},
	},
}));

const { barChartProps } = useBarChart({
	chartData,
	options,
});
</script>

<template>
	<BarChart v-bind="barChartProps" />
</template>
