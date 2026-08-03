<script setup lang="ts">
import { format } from 'date-fns';

const props = defineProps<{
    byDay: { date: string; ms: number }[];
}>();

const W = 800;
const H = 260;
const PAD_X = 40;
const PAD_Y = 24;

const hours = computed(() => props.byDay.map((d) => d.ms / 3600000));
const yMax = computed(() => Math.max(2, Math.ceil(Math.max(0, ...hours.value))));

function x(i: number): number {
    const n = props.byDay.length;

    if (n <= 1) return PAD_X + (W - PAD_X * 2) / 2;

    return PAD_X + (i * (W - PAD_X * 2)) / (n - 1);
}

function y(h: number): number {
    return H - PAD_Y - (h / yMax.value) * (H - PAD_Y * 2);
}

const points = computed(() => hours.value.map((h, i) => `${x(i)},${y(h)}`).join(' '));

const areaPoints = computed(() => {
    if (!props.byDay.length) return '';

    return `${x(0)},${y(0)} ${points.value} ${x(props.byDay.length - 1)},${y(0)}`;
});

const yTicks = computed(() => {
    const step = Math.max(1, Math.ceil(yMax.value / 4));
    const ticks: number[] = [];

    for (let h = 0; h <= yMax.value; h += step) ticks.push(h);

    return ticks;
});

const xLabels = computed(() => {
    const n = props.byDay.length;
    const every = Math.max(1, Math.ceil(n / 8));

    return props.byDay
        .map((d, i) => ({ label: format(new Date(d.date), 'dd MMM'), i }))
        .filter(({ i }) => i % every === 0 || i === n - 1);
});
</script>

<template>
    <BlockWrapper
        title="Time Overview"
        :is-empty="!props.byDay.length"
    >
        <svg
            :viewBox="`0 0 ${W} ${H}`"
            class="w-full h-auto p-4"
            role="img"
            aria-label="Time overview chart"
        >
            <!-- Сетка и подписи Y -->
            <g
                v-for="tick in yTicks"
                :key="tick"
            >
                <line
                    :x1="PAD_X"
                    :x2="W - PAD_X"
                    :y1="y(tick)"
                    :y2="y(tick)"
                    class="stroke-default"
                    stroke-width="1"
                    stroke-dasharray="4 4"
                />
                <text
                    :x="PAD_X - 8"
                    :y="y(tick) + 4"
                    text-anchor="end"
                    class="fill-(--ui-text-muted) text-[10px]"
                >
                    {{ tick }}h
                </text>
            </g>

            <!-- Область + линия -->
            <polygon
                :points="areaPoints"
                class="fill-(--ui-primary)/10"
            />
            <polyline
                :points="points"
                fill="none"
                class="stroke-primary"
                stroke-width="2"
                stroke-linejoin="round"
            />

            <!-- Точки -->
            <circle
                v-for="(h, i) in hours"
                :key="`circle_${i}`"
                :cx="x(i)"
                :cy="y(h)"
                r="3"
                class="fill-primary"
            >
                <title>{{ byDay[i]?.date }}: {{ formatDuration(byDay[i]?.ms || 0) }}</title>
            </circle>

            <!-- Подписи X -->
            <text
                v-for="{ label, i } in xLabels"
                :key="`x${i}`"
                :x="x(i)"
                :y="H - 6"
                text-anchor="middle"
                class="fill-(--ui-text-muted) text-[10px]"
            >
                {{ label }}
            </text>
        </svg>
    </BlockWrapper>
</template>
