<script setup lang="ts">
import { startOfWeek, endOfWeek, endOfDay, isPast, isToday, isTomorrow, format } from 'date-fns';
import type { ITaskCard } from '#shared/types/todo';
import type { ITimesStats } from '#shared/types/times';
import { ETodoStatus } from '#shared/types/times';
import type { IPaginatedResponse } from '#shared/types';
import { round1 } from '#shared/utils/format';
import { taskPriorityColor } from '~/utils/tasks';

interface IProjectRow {
    id: string;
    name: string;
    todo?: { isCompleted?: boolean | null }[];
}

const userStore = useUserStore();
const timesStore = useTimesStore();

const HOUR = 3600000;
const now = ref(Date.now());
const mountedAt = ref(0);
let ticker: ReturnType<typeof setInterval> | undefined;

// Приветствие и «живой» таймер считаем на клиенте, чтобы не ловить рассинхрон гидрации.
const clientHour = ref<number | null>(null);

onMounted(() => {
    clientHour.value = new Date().getHours();
    mountedAt.value = Date.now();
    // Каждую секунду — чтобы часы фокуса тикали в чч:мм:сс.
    ticker = setInterval(() => (now.value = Date.now()), 1_000);
});

onBeforeUnmount(() => clearInterval(ticker));

const greeting = computed(() => {
    const h = clientHour.value;

    if (h === null) return 'Hello';
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';

    return 'Good evening';
});

const firstName = computed(() => userStore.user?.name?.split(' ')[0] || 'there');
const targetHours = computed(() => userStore.user?.workHours || 8);

const weekFrom = startOfWeek(new Date(), { weekStartsOn: 1 });
const weekTo = endOfWeek(new Date(), { weekStartsOn: 1 });

const { data } = await useAsyncData('dashboard', async () => {
    const headers = useRequestHeaders(['cookie']);

    const [todos, projects, stats] = await Promise.all([
        $fetch<IPaginatedResponse<ITaskCard>>('/api/todo', { headers, query: { take: 200 } }),
        $fetch<{ results: IProjectRow[]; count: number }>('/api/projects', { headers, query: { take: 50 } }),
        $fetch<ITimesStats>('/api/times/stats', {
            headers,
            query: { from: weekFrom.toISOString(), to: weekTo.toISOString() },
        }),
    ]);

    return { todos: todos.results, projects: projects.results, stats };
});

const todos = computed<ITaskCard[]>(() => data.value?.todos || []);
const projects = computed<IProjectRow[]>(() => data.value?.projects || []);
const stats = computed<ITimesStats | null>(() => data.value?.stats || null);

// —— KPI ——
const statusCounts = computed(() => {
    const acc = { [ETodoStatus.TODO]: 0, [ETodoStatus.IN_PROGRESS]: 0, [ETodoStatus.REVIEW]: 0, [ETodoStatus.DONE]: 0 };

    for (const t of todos.value) acc[t.status as ETodoStatus] = (acc[t.status as ETodoStatus] || 0) + 1;

    return acc;
});

const activeTasksCount = computed(
    () =>
        statusCounts.value[ETodoStatus.TODO] +
        statusCounts.value[ETodoStatus.IN_PROGRESS] +
        statusCounts.value[ETodoStatus.REVIEW]
);

const myTodos = computed(() => todos.value.filter((t) => t.executor?.id === userStore.user?.id));
const isOverdue = (t: ITaskCard) => t.dueDate && t.status !== ETodoStatus.DONE && isPast(endOfDay(new Date(t.dueDate)));
const myOverdue = computed(() => myTodos.value.filter(isOverdue).length);
const myDueToday = computed(() => myTodos.value.filter((t) => t.dueDate && isToday(new Date(t.dueDate))).length);

// Сколько отработано сегодня — из недельной разбивки по дням.
const todayMs = computed(() => {
    const key = format(new Date(), 'yyyy-MM-dd');

    return stats.value?.byDay.find((d) => d.date === key)?.ms || 0;
});

// Фокус за сегодня в чч:мм:сс. Завершённое из stats уже учитывает активную сессию
// на момент загрузки — доливаем только прошедшее с открытия страницы, без двойного счёта.
const two = (n: number) => String(n).padStart(2, '0');
const focusMs = computed(() => {
    const active = timesStore.activeTime;
    const live = active && isToday(new Date(active.createdAt)) && mountedAt.value ? now.value - mountedAt.value : 0;

    return todayMs.value + live;
});
const todayLabel = computed(
    () =>
        `${two(Math.floor(focusMs.value / HOUR))}:${two(Math.floor(focusMs.value / 60000) % 60)}:${two(Math.floor(focusMs.value / 1000) % 60)}`
);
const focusPercent = computed(() => Math.min(100, round1((focusMs.value / (targetHours.value * HOUR)) * 100)));

// Проекты «под риском» — те, где есть просроченные задачи (по всей выборке задач).
const atRiskProjects = computed(() => {
    const risky = new Set(
        todos.value
            .filter(isOverdue)
            .map((t) => t.project?.id)
            .filter(Boolean)
    );

    return risky.size;
});
const avgProjectCompletion = computed(() => {
    if (!projects.value.length) return 0;
    const sum = projects.value.reduce((acc, p) => {
        const total = p.todo?.length || 0;

        return acc + (total ? (p.todo!.filter((x) => x.isCompleted).length / total) * 100 : 0);
    }, 0);

    return round1(sum / projects.value.length);
});

// —— Upcoming: не завершённые, ближайшие по сроку (без срока — в конец) ——
const upcoming = computed(() =>
    [...myTodos.value]
        .filter((t) => t.status !== ETodoStatus.DONE)
        .sort(
            (a, b) =>
                (a.dueDate ? new Date(a.dueDate).getTime() : Infinity) -
                (b.dueDate ? new Date(b.dueDate).getTime() : Infinity)
        )
        .slice(0, 4)
);

const dueLabel = (due?: string | Date | null) => {
    if (!due) return { text: 'No date', tone: 'text-dimmed' };
    const d = new Date(due);

    if (isToday(d)) return { text: 'Today', tone: 'text-error font-medium' };
    if (isTomorrow(d)) return { text: 'Tomorrow', tone: 'text-warning' };

    return { text: format(d, 'MMM dd'), tone: 'text-muted' };
};
</script>

<template>
    <UDashboardPanel id="home">
        <template #header>
            <UDashboardNavbar
                title="Dashboard"
                :ui="{ right: 'gap-2' }"
            >
                <template #right>
                    <UInput
                        icon="i-lucide-search"
                        placeholder="Search…"
                        class="hidden sm:block"
                    />
                    <UTooltip
                        text="Notifications"
                        :shortcuts="['N']"
                    >
                        <UButton
                            color="neutral"
                            variant="ghost"
                            square
                        >
                            <UChip
                                color="error"
                                inset
                            >
                                <UIcon
                                    name="i-lucide-bell"
                                    class="size-5 shrink-0"
                                />
                            </UChip>
                        </UButton>
                    </UTooltip>
                    <UAvatar
                        :src="userStore.user?.image || undefined"
                        :alt="userStore.user?.name || 'User'"
                        size="sm"
                    />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <!-- Greeting -->
            <div class="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 class="text-2xl font-bold text-highlighted">{{ greeting }}, {{ firstName }} 👋</h1>
                    <p class="text-muted mt-1">Here's what's happening with your work today.</p>
                </div>
                <div class="flex items-center gap-4">
                    <div class="text-right">
                        <p class="text-sm text-muted">Today</p>
                        <p class="font-medium">{{ format(new Date(), 'dd MMMM yyyy') }}</p>
                    </div>
                    <HomeStartSession />
                </div>
            </div>

            <!-- KPI cards -->
            <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <UPageCard variant="subtle">
                    <div class="flex items-center gap-2 text-sm text-muted">
                        <UIcon
                            name="i-lucide-clock"
                            class="size-4 text-primary"
                        />
                        Today's Focus
                    </div>
                    <p class="text-2xl font-bold mt-1">{{ todayLabel }}</p>
                    <div class="flex items-center justify-between text-xs text-muted mt-2">
                        <span>Target: {{ targetHours }}h</span>
                        <span class="font-semibold text-default">{{ focusPercent }}%</span>
                    </div>
                    <div class="h-1.5 rounded-full bg-elevated mt-1.5 overflow-hidden">
                        <div
                            class="h-full rounded-full bg-primary"
                            :style="{ width: `${focusPercent}%` }"
                        />
                    </div>
                </UPageCard>

                <UPageCard variant="subtle">
                    <div class="flex items-center gap-2 text-sm text-muted">
                        <UIcon
                            name="i-lucide-list-checks"
                            class="size-4 text-secondary"
                        />
                        Active Tasks
                    </div>
                    <p class="text-2xl font-bold mt-1">{{ activeTasksCount }}</p>
                    <p class="text-xs text-muted mt-2">
                        <span class="text-secondary">{{ statusCounts[ETodoStatus.IN_PROGRESS] }} in progress</span> ·
                        {{ statusCounts[ETodoStatus.REVIEW] }} review
                    </p>
                </UPageCard>

                <UPageCard variant="subtle">
                    <div class="flex items-center gap-2 text-sm text-muted">
                        <UIcon
                            name="i-lucide-circle-check"
                            class="size-4 text-info"
                        />
                        My Tasks
                    </div>
                    <p class="text-2xl font-bold mt-1">{{ myTodos.length }}</p>
                    <p class="text-xs text-muted mt-2">
                        <span :class="myOverdue ? 'text-error' : ''">{{ myOverdue }} overdue</span> ·
                        {{ myDueToday }} due today
                    </p>
                </UPageCard>

                <UPageCard variant="subtle">
                    <div class="flex items-center gap-2 text-sm text-muted">
                        <UIcon
                            name="i-lucide-folder"
                            class="size-4 text-success"
                        />
                        Projects
                    </div>
                    <div class="flex items-end justify-between">
                        <div>
                            <p class="text-2xl font-bold mt-1">{{ projects.length }}</p>
                            <p class="text-xs text-muted mt-2">
                                {{ projects.length - atRiskProjects }} on track ·
                                <span :class="atRiskProjects ? 'text-warning' : ''">{{ atRiskProjects }} at risk</span>
                            </p>
                        </div>
                        <p class="text-lg font-semibold text-success">{{ avgProjectCompletion }}%</p>
                    </div>
                </UPageCard>
            </div>

            <!-- Main content row -->
            <div class="grid gap-6 xl:grid-cols-3">
                <!-- Upcoming tasks -->
                <UPageCard
                    variant="subtle"
                    :ui="{ container: 'content-start' }"
                >
                    <div class="flex items-center justify-between">
                        <h3 class="font-semibold text-highlighted">Upcoming Tasks</h3>
                        <UButton
                            label="View all"
                            :to="ERoutes.TASKS"
                            variant="link"
                            size="xs"
                            :padded="false"
                        />
                    </div>

                    <div
                        v-if="upcoming.length"
                        class="grid mt-2 divide-y divide-default"
                    >
                        <ULink
                            v-for="task in upcoming"
                            :key="task.id"
                            :to="ERoutes.TASKS"
                            class="flex items-center gap-3 py-3 first:pt-2"
                        >
                            <span
                                class="size-2 rounded-full shrink-0"
                                :class="{
                                    'bg-error': taskPriorityColor(task.priority ?? null) === 'error',
                                    'bg-warning': taskPriorityColor(task.priority ?? null) === 'warning',
                                    'bg-success': taskPriorityColor(task.priority ?? null) === 'success',
                                    'bg-muted': taskPriorityColor(task.priority ?? null) === 'neutral',
                                }"
                            />
                            <div class="min-w-0 flex-1">
                                <p class="text-sm font-medium truncate">{{ task.name }}</p>
                                <p class="text-xs text-muted truncate">{{ task.project?.name || 'No project' }}</p>
                            </div>
                            <span
                                class="text-xs shrink-0"
                                :class="dueLabel(task.dueDate).tone"
                                >{{ dueLabel(task.dueDate).text }}</span
                            >
                        </ULink>
                    </div>
                    <p
                        v-else
                        class="text-sm text-muted py-6 text-center"
                    >
                        No upcoming tasks
                    </p>
                </UPageCard>

                <!-- Work overview (donut) -->
                <HomeWorkOverview :counts="statusCounts" />

                <!-- Time this week (bars) -->
                <HomeTimeWeek
                    v-if="stats"
                    :by-day="stats.byDay"
                    :total-ms="stats.totals.totalMs"
                />
            </div>

            <!-- Active projects -->
            <HomeActiveProjects :projects="projects" />
        </template>
    </UDashboardPanel>
</template>
