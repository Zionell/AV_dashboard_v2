<script setup lang="ts">
import { format, sub } from 'date-fns';
import type { Range, ITimesStats, ITeamSummaryRow } from '#shared/types/times';
import TimesSummary from '~/components/times/TimesSummary.vue';
import TimesByProject from '~/components/times/TimesByProject.vue';

const userStore = useUserStore();

const range = shallowRef<Range>({
    start: sub(new Date(), { days: 14 }),
    end: new Date(),
});
const selectedUserId = ref<string>(userStore.user?.id ?? 'all');
const selectedProjectId = ref<string | null>(null);

const from = computed(() => format(new Date(range.value.start), 'yyyy-MM-dd'));
const to = computed(() => format(new Date(range.value.end), 'yyyy-MM-dd'));

const { data: stats, status } = await useFetch<ITimesStats>('/api/times/stats', {
    query: {
        from,
        to,
        userId: selectedUserId,
        projectId: selectedProjectId,
    },
});

const { data: team } = await useLazyFetch<ITeamSummaryRow[]>('/api/times/team', {
    immediate: userStore.canManageContent,
    default: () => [] as ITeamSummaryRow[],
});

const { data: projects } = await useLazyFetch('/api/projects', {
    query: { take: 50 },
});

const employeeItems = computed(() => [
    { label: 'All Employees', value: 'all' },
    ...(team.value || []).map((m) => ({ label: m.name || m.userId, value: m.userId })),
]);

/**
 * Норма у каждого своя, поэтому одной цифрой она описывается только когда в выборке
 * один человек. Для «All Employees» сервер суммирует личные нормы — числа тут не будет.
 */
const normCaption = computed(() => {
    if (selectedUserId.value === 'all') return 'Target: personal norm of each member';

    const hours =
        selectedUserId.value === userStore.user?.id
            ? userStore.user?.workHours
            : team.value?.find((m) => m.userId === selectedUserId.value)?.workHours;

    return hours ? `Target ${hours}h/day` : 'Target: personal norm';
});

const projectItems = computed(() => [
    { label: 'All projects', value: null },
    ...(projects.value?.results || []).map((p) => ({ label: p.name, value: p.id })),
]);

interface IStatCard {
    label: string;
    icon: string;
    value: string;
    caption: string;
}

const statCards = computed((): IStatCard[] => {
    const t = stats.value?.totals;

    if (!t) return [];

    const overtimeSign = t.overtimeMs > 0 ? '+' : t.overtimeMs < 0 ? '−' : '';

    return [
        { label: 'Total Time', icon: 'i-lucide-clock', value: formatDuration(t.totalMs), caption: 'For the period' },
        {
            label: 'Avg / Day',
            icon: 'i-lucide-trending-up',
            value: formatDuration(t.avgPerDayMs),
            caption: 'Per working day',
        },
        {
            label: 'Working Days',
            icon: 'i-lucide-calendar-days',
            value: String(t.workingDays),
            caption: 'Days with logs',
        },
        {
            label: 'Overtime',
            icon: 'i-lucide-timer',
            value: `${overtimeSign}${formatDuration(Math.abs(t.overtimeMs))}`,
            caption: normCaption.value,
        },
    ];
});

function exportCsv() {
    const header = ['Date', 'Start', 'End', 'Employee', 'Project', 'Task', 'Duration (h)'];
    const rows = (stats.value?.logs || []).map((log) => [
        format(new Date(log.start), 'yyyy-MM-dd'),
        format(new Date(log.start), 'HH:mm'),
        log.active ? '' : format(new Date(log.end), 'HH:mm'),
        log.userName || '',
        log.projectName || '',
        log.todoName || '',
        (log.durationMs / 3600000).toFixed(2),
    ]);

    const csv = [header, ...rows]
        .map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(';'))
        .join('\n');

    const link = document.createElement('a');

    link.href = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    link.download = `times_${from.value}_${to.value}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
}

async function handleChangeDate(dates: Range) {
    range.value = dates;
}
</script>

<template>
    <UDashboardPanel
        id="times"
        :ui="{ body: 'lg:py-12' }"
    >
        <template #header>
            <UDashboardNavbar title="Times">
                <template #right>
                    <UButton
                        icon="i-lucide-download"
                        label="Export"
                        variant="outline"
                        color="neutral"
                        @click="exportCsv"
                    />
                </template>
            </UDashboardNavbar>

            <UDashboardToolbar class="py-6">
                <template #left>
                    <CurrentDate />
                </template>

                <template #right>
                    <USelect
                        v-if="userStore.canManageContent"
                        v-model="selectedUserId"
                        :items="employeeItems"
                        class="min-w-40"
                    />

                    <USelect
                        v-model="selectedProjectId"
                        :items="projectItems"
                        placeholder="All projects"
                        class="min-w-36"
                    />

                    <DateRangePicker
                        v-model="range"
                        class="-ms-1"
                        @change="handleChangeDate"
                    />
                </template>
            </UDashboardToolbar>
        </template>

        <template #body>
            <section class="grid gap-6">
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <SmallCard
                        v-for="card in statCards"
                        :key="card.label"
                        :card="card"
                    />
                </div>

                <div class="grid grid-cols-1 xl:grid-cols-[1fr_20rem] gap-6 items-start">
                    <TimesChart :by-day="stats?.byDay || []" />

                    <TimesByProject
                        :by-project="stats?.byProject || []"
                        :totals="stats?.totals"
                        :is-loading="status === 'pending'"
                    />
                </div>

                <div class="grid grid-cols-1 xl:grid-cols-[24rem_1fr] gap-6 items-start">
                    <TimesSummary
                        v-if="userStore.canManageContent"
                        :team="team"
                    />

                    <TimesLogs
                        :logs="stats?.logs || []"
                        :selected-user-id="selectedUserId"
                    />
                </div>
            </section>
        </template>
    </UDashboardPanel>
</template>
