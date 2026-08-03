<script setup lang="ts">
import type { IProjectStats } from '#shared/types/projects';
import { round1 } from '#shared/utils/format';

const props = defineProps<{
    stats: IProjectStats;
}>();

interface IStatCard {
    label: string;
    icon: string;
    value: string;
    caption: string;
}

const cards = computed((): IStatCard[] => {
    const s = props.stats;
    const completedPercent = s.totalTasks ? round1((s.completedTasks / s.totalTasks) * 100) : 0;

    return [
        {
            label: 'Tasks',
            icon: 'i-lucide-clipboard-list',
            value: String(s.totalTasks),
            caption: 'Total tasks',
        },
        {
            label: 'Completed',
            icon: 'i-lucide-check-circle',
            value: String(s.completedTasks),
            caption: `${completedPercent}%`,
        },
        {
            label: 'Members',
            icon: 'i-lucide-users',
            value: String(s.membersCount),
            caption: 'Active',
        },
        {
            label: 'Total Time',
            icon: 'i-lucide-clock',
            value: formatDuration(s.totalTimeMs),
            caption: 'Tracked',
        },
    ];
});
</script>

<template>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <UPageCard
            v-for="card in cards"
            :key="card.label"
            variant="subtle"
            :ui="{ container: 'p-4 sm:p-4' }"
        >
            <div class="flex items-center gap-2 text-muted text-sm">
                <UIcon
                    :name="card.icon"
                    class="w-4 h-4"
                />
                {{ card.label }}
            </div>
            <p class="text-2xl font-bold">{{ card.value }}</p>
            <p class="text-xs text-muted">{{ card.caption }}</p>
        </UPageCard>
    </div>
</template>
