<script setup lang="ts">
import { round1 } from '#shared/utils/format';

interface IProjectRow {
    id: string;
    name: string;
    todo?: { isCompleted?: boolean | null }[];
}

const props = defineProps<{
    projects: IProjectRow[];
}>();

// Разноцветные прогресс-бары по кругу — как на макете.
const BARS = ['bg-primary', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500'];

const rows = computed(() =>
    props.projects.map((p, i) => {
        const total = p.todo?.length || 0;
        const done = p.todo?.filter((t) => t.isCompleted).length || 0;

        return {
            id: p.id,
            name: p.name,
            tasks: total,
            percent: total ? round1((done / total) * 100) : 0,
            bar: BARS[i % BARS.length],
        };
    })
);
</script>

<template>
    <UPageCard variant="subtle">
        <div class="flex items-center justify-between">
            <h3 class="font-semibold text-highlighted">Active Projects</h3>
            <UButton
                label="View all"
                :to="ERoutes.PROJECTS"
                variant="link"
                size="xs"
                :padded="false"
            />
        </div>

        <div class="grid gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            <ULink
                v-for="row in rows"
                :key="row.id"
                :to="`${ERoutes.PROJECTS}/${row.id}`"
                class="rounded-lg ring ring-default p-4 hover:bg-elevated/50 transition"
            >
                <p class="font-medium truncate">{{ row.name }}</p>
                <div class="h-1.5 rounded-full bg-elevated mt-3 overflow-hidden">
                    <div
                        class="h-full rounded-full"
                        :class="row.bar"
                        :style="{ width: `${row.percent}%` }"
                    />
                </div>
                <div class="flex items-center justify-between text-xs text-muted mt-2">
                    <span>{{ row.tasks }} {{ row.tasks === 1 ? 'task' : 'tasks' }}</span>
                    <span class="font-semibold text-default">{{ row.percent }}%</span>
                </div>
            </ULink>

            <ULink
                :to="`${ERoutes.PROJECTS}/new`"
                class="rounded-lg border border-dashed border-default p-4 grid place-content-center text-center text-muted hover:text-default hover:border-primary transition min-h-24"
            >
                <UIcon
                    name="i-lucide-plus"
                    class="size-5 mx-auto"
                />
                <span class="text-sm mt-1">Add Project</span>
            </ULink>
        </div>
    </UPageCard>
</template>
