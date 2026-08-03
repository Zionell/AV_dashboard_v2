<script setup lang="ts">
import { ETodoStatus } from '#shared/types/times';
import type { IProjectStats } from '#shared/types/projects';
import { round1 } from '#shared/utils/format';

const props = defineProps<{
    stats: IProjectStats;
}>();

const rows = computed(() => {
    const total = props.stats.totalTasks;
    const byStatus = props.stats.byStatus;

    return [
        { label: 'Todo', status: ETodoStatus.TODO, class: 'bg-neutral-400' },
        { label: 'In Progress', status: ETodoStatus.IN_PROGRESS, class: 'bg-secondary' },
        { label: 'Review', status: ETodoStatus.REVIEW, class: 'bg-warning' },
        { label: 'Done', status: ETodoStatus.DONE, class: 'bg-success' },
    ].map((row) => {
        const count = byStatus[row.status] || 0;

        return {
            ...row,
            count,
            percent: total ? round1((count / total) * 100) : 0,
        };
    });
});

const completedPercent = computed(() => {
    const s = props.stats;

    return s.totalTasks ? round1((s.completedTasks / s.totalTasks) * 100) : 0;
});
</script>

<template>
    <UPageCard
        variant="subtle"
        :ui="{ container: 'p-4 sm:p-6 gap-y-4' }"
    >
        <div class="flex items-center justify-between">
            <h3 class="font-semibold text-highlighted">Project Progress</h3>
            <span class="text-xl font-bold">{{ completedPercent }}%</span>
        </div>

        <!-- Сегментированный бар по статусам -->
        <div class="flex h-2 rounded-full overflow-hidden bg-elevated">
            <div
                v-for="row in rows"
                :key="row.label"
                :class="row.class"
                :style="{ width: `${row.percent}%` }"
            />
        </div>

        <ul class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <li
                v-for="row in rows"
                :key="row.label"
            >
                <span class="flex items-center gap-2 text-muted text-xs">
                    <span
                        class="w-2 h-2 rounded-full"
                        :class="row.class"
                    />
                    {{ row.label }}
                </span>
                <span class="font-semibold text-lg">{{ row.count }}</span>
                <span class="text-xs text-muted ml-1.5">{{ row.percent }}%</span>
            </li>
        </ul>
    </UPageCard>
</template>
