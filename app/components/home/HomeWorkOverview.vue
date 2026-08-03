<script setup lang="ts">
import { ETodoStatus } from '#shared/types/times';
import { round1 } from '#shared/utils/format';

const props = defineProps<{
    counts: Record<ETodoStatus, number>;
}>();

// Порядок и цвета — как в канбане задач (TasksKanban), чтобы легенда совпадала.
const segments = computed(() => [
    { key: ETodoStatus.DONE, label: 'Completed', color: 'var(--color-green-500)', dot: 'bg-green-500' },
    { key: ETodoStatus.IN_PROGRESS, label: 'In Progress', color: 'var(--color-blue-500)', dot: 'bg-blue-500' },
    { key: ETodoStatus.REVIEW, label: 'Review', color: 'var(--color-purple-500)', dot: 'bg-purple-500' },
    { key: ETodoStatus.TODO, label: 'Todo', color: 'var(--color-neutral-500)', dot: 'bg-neutral-400' },
]);

const total = computed(() => segments.value.reduce((sum, s) => sum + (props.counts[s.key] || 0), 0));

const donePercent = computed(() =>
    total.value ? round1(((props.counts[ETodoStatus.DONE] || 0) / total.value) * 100) : 0
);

// Кольцо: окружность 100 (r так подобран), поэтому dasharray = процент напрямую.
// Каждому сегменту — своя дуга со смещением на сумму предыдущих.
const arcs = computed(() => {
    let offset = 0;

    return segments.value.map((s) => {
        const percent = total.value ? ((props.counts[s.key] || 0) / total.value) * 100 : 0;
        const arc = { ...s, percent, dash: `${percent} ${100 - percent}`, offset: 25 - offset };

        offset += percent;

        return arc;
    });
});
</script>

<template>
    <UPageCard
        variant="subtle"
        :ui="{ container: 'content-start' }"
    >
        <div class="flex items-center justify-between">
            <h3 class="font-semibold text-highlighted">Work Overview</h3>
            <UButton
                label="View report"
                :to="ERoutes.TASKS"
                variant="link"
                size="xs"
                :padded="false"
            />
        </div>

        <div class="flex items-center gap-6 mt-2">
            <div class="relative shrink-0 size-36">
                <svg
                    viewBox="0 0 36 36"
                    class="size-36 -rotate-90"
                >
                    <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        class="stroke-elevated"
                        stroke-width="3.4"
                    />
                    <circle
                        v-for="arc in arcs"
                        :key="arc.key"
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="none"
                        :stroke="arc.color"
                        stroke-width="3.6"
                        :stroke-dasharray="arc.dash"
                        :stroke-dashoffset="arc.offset"
                    />
                </svg>
                <div class="absolute inset-0 grid place-content-center text-center">
                    <p class="text-2xl font-bold leading-none">{{ donePercent }}%</p>
                    <p class="text-[11px] text-muted mt-1">Completed<br />this week</p>
                </div>
            </div>

            <div class="grid gap-2.5 flex-1">
                <div
                    v-for="s in segments"
                    :key="s.key"
                    class="flex items-center gap-2 text-sm"
                >
                    <span
                        class="size-2 rounded-full"
                        :class="s.dot"
                    />
                    <span class="text-muted">{{ s.label }}</span>
                    <span class="ml-auto font-semibold tabular-nums">{{ props.counts[s.key] || 0 }}</span>
                </div>
            </div>
        </div>
    </UPageCard>
</template>
