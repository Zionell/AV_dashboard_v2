<script setup lang="ts">
import type { IByProject, ITotalsTimeStats } from '#shared/types/times';
import { round1 } from '#shared/utils/format';

const props = defineProps<{
    byProject: IByProject[];
    totals: ITotalsTimeStats | undefined;
    isLoading?: boolean;
}>();

const maxProjectMs = computed(() => Math.max(1, ...(props.byProject || []).map((p) => p.ms)));
</script>

<template>
    <BlockWrapper
        title="Time by Project"
        :is-empty="!props.byProject.length"
        :is-loading="props.isLoading"
    >
        <ul class="grid gap-3 text-sm p-4">
            <li
                v-for="project in props.byProject"
                :key="project.projectId || 'none'"
                class="grid gap-1"
            >
                <div class="flex items-center justify-between gap-2">
                    <span class="truncate">{{ project.name }}</span>
                    <span class="text-muted whitespace-nowrap">
                        {{ formatDuration(project.ms) }}
                        ({{ round1((project.ms / Math.max(1, props.totals?.totalMs || 0)) * 100) }}%)
                    </span>
                </div>
                <UProgress
                    :model-value="(project.ms / maxProjectMs) * 100"
                    size="sm"
                />
            </li>
        </ul>
    </BlockWrapper>
</template>
