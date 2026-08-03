<script setup lang="ts">
import type { ICompanyStats } from '#shared/types/company';

const userStore = useUserStore();

const { data: company, refresh } = await useFetch('/api/company');

// Статистика доступна owner/manager (RBAC), employee видит только карточку компании.
const { data: stats } = await useFetch<ICompanyStats | null>('/api/company/stats', {
    immediate: userStore.canManageContent,
    default: () => null as ICompanyStats | null,
});

const isHasCompany = computed(() => !!userStore.user?.companyId);

interface IStatCard {
    label: string;
    icon: string;
    value: string;
    caption: string;
    delta?: number | null;
}

const statCards = computed((): IStatCard[] => {
    const s = stats.value;

    if (!s) return [];

    return [
        {
            label: 'Members',
            icon: 'i-lucide-users',
            value: String(s.members.total),
            caption: 'Total members',
            delta: s.members.newThisMonth || null,
        },
        {
            label: 'Projects',
            icon: 'i-lucide-folder-open',
            value: String(s.projects.active),
            caption: `Active projects · ${s.projects.closed} closed`,
        },
        {
            label: 'Active Tasks',
            icon: 'i-lucide-clipboard-check',
            value: String(s.tasks.inProgress),
            caption: 'In progress tasks',
        },
        {
            label: 'Time Today',
            icon: 'i-lucide-clock',
            value: formatDuration(s.time.todayMs),
            caption: 'Logged by all',
            delta: deltaPercent(s.time.todayMs, s.time.yesterdayMs),
        },
        {
            label: 'This Week',
            icon: 'i-lucide-calendar-days',
            value: formatDuration(s.time.weekMs),
            caption: 'Logged by all',
            delta: deltaPercent(s.time.weekMs, s.time.lastWeekMs),
        },
        {
            label: 'This Month',
            icon: 'i-lucide-calendar',
            value: formatDuration(s.time.monthMs),
            caption: 'Logged by all',
            delta: deltaPercent(s.time.monthMs, s.time.lastMonthMs),
        },
        {
            label: 'Avg / Person',
            icon: 'i-lucide-user',
            value: formatDuration(s.time.avgPerMemberWeekMs),
            caption: 'Per member this week',
        },
    ];
});

const teamOverview = computed(() => {
    const byRole = stats.value?.members.byRole || {};

    return [
        { label: 'Owners', count: byRole.OWNER || 0, color: 'primary' as const },
        { label: 'Managers', count: byRole.MANAGER || 0, color: 'info' as const },
        { label: 'Employees', count: byRole.EMPLOYEE || 0, color: 'success' as const },
    ];
});
</script>

<template>
    <UDashboardPanel id="company">
        <template #header>
            <UDashboardNavbar
                title="Company"
                :ui="{ right: 'gap-3' }"
            >
                <template #right>
                    <InviteModal v-if="userStore.isOwner" />
                </template>
            </UDashboardNavbar>

            <UDashboardToolbar class="py-6">
                <template #left>
                    <CurrentDate />
                </template>
            </UDashboardToolbar>
        </template>

        <template #body>
            <transition
                name="fade"
                mode="out-in"
            >
                <article
                    v-if="!isHasCompany"
                    class="flex items-center justify-center flex-col h-full"
                >
                    <div class="text-xl text-center font-bold mb-6">
                        Sorry, your company hasn't been created in our app yet.
                        <br />
                        To keep using the features, please create a company.
                    </div>
                    <AddNewCompany @refresh="refresh" />
                </article>

                <article v-else>
                    <h2 class="text-lg font-semibold mb-6">Company name: {{ company?.name }}</h2>

                    <div class="grid grid-cols-1 xl:grid-cols-[1fr_20rem] gap-6 items-start">
                        <!-- Основная колонка -->
                        <div class="grid gap-6">
                            <template v-if="stats">
                                <!-- Стат-карты -->
                                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <UPageCard
                                        v-for="card in statCards"
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
                                        <p class="text-xs text-muted">
                                            {{ card.caption }}
                                            <span
                                                v-if="card.delta"
                                                :class="card.delta > 0 ? 'text-success' : 'text-error'"
                                            >
                                                {{ card.delta > 0 ? '↑' : '↓' }} {{ Math.abs(card.delta)
                                                }}{{ card.label === 'Members' ? ' new' : '%' }}
                                            </span>
                                        </p>
                                    </UPageCard>
                                </div>

                                <!-- Проекты: задачи и участники -->
                                <UPageCard
                                    v-if="stats.projects.items.length"
                                    variant="subtle"
                                    :ui="{ container: 'p-0 sm:p-0 gap-y-0' }"
                                >
                                    <table class="w-full text-sm">
                                        <thead>
                                            <tr class="text-left text-muted border-b border-default">
                                                <th class="font-medium py-3 px-4 sm:px-6">Project</th>
                                                <th class="font-medium py-3 px-4">Tasks</th>
                                                <th class="font-medium py-3 px-4">Members</th>
                                                <th class="font-medium py-3 px-4">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-default">
                                            <tr
                                                v-for="project in stats.projects.items"
                                                :key="project.id"
                                            >
                                                <td class="py-3 px-4 sm:px-6 font-medium text-highlighted">
                                                    {{ project.name }}
                                                </td>
                                                <td class="py-3 px-4">
                                                    {{ project.completedTodos }} / {{ project.totalTodos }}
                                                </td>
                                                <td class="py-3 px-4">{{ project.members }}</td>
                                                <td class="py-3 px-4">
                                                    <UBadge
                                                        :color="project.isClosed ? 'neutral' : 'success'"
                                                        variant="subtle"
                                                    >
                                                        {{ project.isClosed ? 'Closed' : 'Active' }}
                                                    </UBadge>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </UPageCard>

                                <!-- Участники -->
                                <MembersList />
                            </template>
                        </div>

                        <!-- Правая колонка -->
                        <div
                            v-if="stats"
                            class="grid gap-6"
                        >
                            <UPageCard
                                title="Team Overview"
                                variant="subtle"
                            >
                                <ul class="grid gap-2 text-sm">
                                    <li
                                        v-for="role in teamOverview"
                                        :key="role.label"
                                        class="flex items-center justify-between"
                                    >
                                        <span class="flex items-center gap-2">
                                            <UBadge
                                                :color="role.color"
                                                variant="solid"
                                                class="w-2 h-2 p-0 rounded-full"
                                            />
                                            {{ role.label }}
                                        </span>
                                        <span class="font-medium">{{ role.count }}</span>
                                    </li>
                                    <li class="flex items-center justify-between border-t border-default pt-2 mt-1">
                                        <span>Total</span>
                                        <span class="font-medium">{{ stats.members.total }}</span>
                                    </li>
                                </ul>
                            </UPageCard>

                            <CompanyPlan />

                            <!-- Заглушка: агрегации событий по компании пока нет. Розовый бордер — маркер статики, не убирать без реализации. -->
                            <UPageCard
                                title="Recent Activity"
                                variant="subtle"
                                class="border-2 border-pink-500"
                            >
                                <p class="text-sm text-muted">The company activity feed is coming soon.</p>
                            </UPageCard>
                        </div>
                    </div>
                </article>
            </transition>
        </template>
    </UDashboardPanel>
</template>
