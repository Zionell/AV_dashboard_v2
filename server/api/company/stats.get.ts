import { startOfDay, startOfWeek, startOfMonth, subDays, subWeeks, subMonths } from 'date-fns';
import { dbClient } from '~~/lib/dbClient';
import { EUserRole } from '#shared/types/user';
import type { ICompanyStats, ICompanyProjectStat } from '#shared/types/company';

export default defineEventHandler(async (event): Promise<ICompanyStats> => {
    try {
        requireRole(event, EUserRole.OWNER, EUserRole.MANAGER);
        const companyId = requireCompanyId(event);

        const now = new Date();
        const dayStart = startOfDay(now);
        const yesterdayStart = startOfDay(subDays(now, 1));
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
        const monthStart = startOfMonth(now);
        const lastMonthStart = startOfMonth(subMonths(now, 1));

        const [members, projects] = await Promise.all([
            dbClient.user.findMany({
                where: { companyId },
                select: { id: true, role: true, createdAt: true },
            }),
            dbClient.project.findMany({
                where: { companyId },
                select: {
                    id: true,
                    name: true,
                    todo: { select: { isCompleted: true } },
                    _count: { select: { users: true } },
                },
            }),
        ]);

        const memberIds = members.map((m) => m.id);

        // Все сессии с начала прошлого месяца — самая ранняя нужная граница.
        const times = await dbClient.times.findMany({
            where: {
                userId: { in: memberIds },
                createdAt: { gte: lastMonthStart },
            },
            select: { createdAt: true, updatedAt: true, active: true },
        });

        const bucket = (from: Date, to?: Date) =>
            times
                .filter((t) => t.createdAt >= from && (!to || t.createdAt < to))
                .reduce(
                    (sum, t) => sum + Math.max(0, (t.active ? now : t.updatedAt).getTime() - t.createdAt.getTime()),
                    0
                );

        const byRole: Record<string, number> = {};
        for (const m of members) {
            byRole[m.role] = (byRole[m.role] || 0) + 1;
        }

        const projectItems: ICompanyProjectStat[] = projects.map((p) => {
            const totalTodos = p.todo.length;
            const completedTodos = p.todo.filter((t) => t.isCompleted).length;

            return {
                id: p.id,
                name: p.name,
                totalTodos,
                completedTodos,
                members: p._count.users,
                // Закрытый проект — есть задачи и все выполнены.
                isClosed: totalTodos > 0 && completedTodos === totalTodos,
            };
        });

        const closed = projectItems.filter((p) => p.isClosed).length;
        const weekMs = bucket(weekStart);

        return {
            members: {
                total: members.length,
                newThisMonth: members.filter((m) => m.createdAt >= monthStart).length,
                byRole,
            },
            projects: {
                active: projectItems.length - closed,
                closed,
                items: projectItems,
            },
            tasks: {
                inProgress: projectItems.reduce((sum, p) => sum + (p.totalTodos - p.completedTodos), 0),
            },
            time: {
                todayMs: bucket(dayStart),
                yesterdayMs: bucket(yesterdayStart, dayStart),
                weekMs,
                lastWeekMs: bucket(lastWeekStart, weekStart),
                monthMs: bucket(monthStart),
                lastMonthMs: bucket(lastMonthStart, monthStart),
                avgPerMemberWeekMs: members.length ? Math.round(weekMs / members.length) : 0,
            },
        };
    } catch (e) {
        logger.warn('Company stats/ get: ', e);
        throw e;
    }
});
