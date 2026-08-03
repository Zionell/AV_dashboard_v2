<script setup lang="ts">
import { format, isToday, isWeekend, parseISO } from 'date-fns';

const props = defineProps<{
    byDay: { date: string; ms: number }[];
    totalMs: number;
}>();

const HOUR = 3600000;

const maxMs = computed(() => Math.max(HOUR, ...props.byDay.map((d) => d.ms)));

const bars = computed(() =>
    props.byDay.map((d) => {
        const date = parseISO(d.date);

        return {
            date,
            label: format(date, 'EEEEEE'),
            hours: d.ms / HOUR,
            height: Math.round((d.ms / maxMs.value) * 100),
            weekend: isWeekend(date),
            today: isToday(date),
        };
    })
);

// Пара ориентиров по оси Y (0 и максимум в целых часах).
const axisTop = computed(() => Math.ceil(maxMs.value / HOUR));

const totalLabel = computed(() => {
    const h = Math.floor(props.totalMs / HOUR);
    const m = Math.round((props.totalMs % HOUR) / 60000);

    return `${h}h ${m}m`;
});
</script>

<template>
    <UPageCard
        variant="subtle"
        :ui="{ container: 'content-start' }"
    >
        <div class="flex items-center justify-between">
            <h3 class="font-semibold text-highlighted">Time This Week</h3>
            <UButton
                label="View all"
                :to="ERoutes.TIMES"
                variant="link"
                size="xs"
                :padded="false"
            />
        </div>

        <div class="flex gap-3 mt-4">
            <div class="flex flex-col justify-between text-[10px] text-dimmed py-1 tabular-nums">
                <span>{{ axisTop }}</span>
                <span>{{ Math.round(axisTop / 2) }}</span>
                <span>0</span>
            </div>

            <div class="grid grid-cols-7 gap-2 flex-1 items-end h-40">
                <div
                    v-for="bar in bars"
                    :key="bar.date.toISOString()"
                    class="flex flex-col items-center gap-2 h-full justify-end"
                >
                    <UTooltip :text="`${bar.hours.toFixed(1)}h`">
                        <div
                            class="w-full max-w-8 rounded-md transition-all"
                            :class="bar.weekend ? 'bg-elevated' : 'bg-primary'"
                            :style="{ height: `${Math.max(bar.height, 2)}%` }"
                        />
                    </UTooltip>
                    <span
                        class="text-[11px]"
                        :class="bar.today ? 'text-highlighted font-semibold' : 'text-muted'"
                        >{{ bar.label }}</span
                    >
                </div>
            </div>
        </div>

        <USeparator class="my-3" />

        <div class="flex items-center justify-between text-sm">
            <span class="text-muted">Total</span>
            <span class="font-semibold">{{ totalLabel }}</span>
        </div>
    </UPageCard>
</template>
