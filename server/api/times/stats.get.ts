import { eachDayOfInterval, endOfDay, format, startOfDay, subDays } from 'date-fns';
import { dbClient } from '~~/lib/dbClient';
import { EUserRole } from '#shared/types/user';
import { ETodoStatus, type ITimesStats } from '#shared/types/times';

interface IQuery {
    from?: string;
    to?: string;
    userId?: string;
    projectId?: string;
}

/** Пользователи, чьё время доступно текущему юзеру: owner — компания, manager — участники его проектов, employee — только он сам. */
async function allowedUserIds(userId: string, role: string, companyId: string): Promise<string[]> {
    if (role === EUserRole.OWNER) {
        const users = await dbClient.user.findMany({
            where: { companyId },
            select: { id: true },
        });

        return users.map((u) => u.id);
    }

    if (role === EUserRole.MANAGER) {
        const own = await dbClient.usersOnProjects.findMany({
            where: { userId },
            select: { projectId: true },
        });
        const links = await dbClient.usersOnProjects.findMany({
            where: { projectId: { in: own.map((p) => p.projectId) } },
            select: { userId: true },
        });

        return [...new Set([userId, ...links.map((l) => l.userId)])];
    }

    return [userId];
}

export default defineEventHandler(async (event): Promise<ITimesStats> => {
    try {
        const user = requireApiUser(event);
        const companyId = requireCompanyId(event);
        const query: IQuery = getQuery(event);

        const now = new Date();
        const from = startOfDay(query.from ? new Date(query.from) : subDays(now, 14));
        const to = endOfDay(query.to ? new Date(query.to) : now);

        if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
            throw createError({ statusCode: 400, message: 'Invalid period' });
        }
        if (to.getTime() - from.getTime() > 366 * 24 * 3600000) {
            throw createError({ statusCode: 400, message: 'The period cannot exceed one year' });
        }

        const allowed = await allowedUserIds(user.id, user.role, companyId);

        let targetIds = allowed;

        if (query.userId && query.userId !== 'all') {
            if (!allowed.includes(query.userId)) {
                throw createError({ statusCode: 404, message: 'Member not found' });
            }
            targetIds = [query.userId];
        }

        if (query.projectId) {
            await requireProjectMembership(event, query.projectId);
        }

        const sessions = await dbClient.times.findMany({
            where: {
                userId: { in: targetIds },
                createdAt: { gte: from, lte: to },
                ...(query.projectId ? { todo: { projectId: query.projectId } } : {}),
            },
            include: {
                user: { select: { name: true, workHours: true } },
                todo: { select: { name: true, status: true, project: { select: { id: true, name: true } } } },
            },
            orderBy: { createdAt: 'desc' },
        });

        const durationOf = (s: (typeof sessions)[number]) =>
            Math.max(0, (s.active ? now : s.updatedAt).getTime() - s.createdAt.getTime());

        const byDayMap: Record<string, number> = {};
        const byProjectMap: Record<string, { name: string; ms: number }> = {};
        // Норму считаем по каждому отдельно: у людей разные workHours, и суммировать
        // их дни в один счётчик нельзя — выборка может быть на несколько человек.
        const normByUser: Record<string, { days: Set<string>; workHours: number }> = {};
        let totalMs = 0;

        for (const s of sessions) {
            const ms = durationOf(s);
            const day = format(s.createdAt, 'yyyy-MM-dd');
            const projectKey = s.todo?.project?.id || 'none';

            totalMs += ms;
            byDayMap[day] = (byDayMap[day] || 0) + ms;

            const norm = (normByUser[s.userId] ||= { days: new Set(), workHours: s.user.workHours });
            norm.days.add(day);

            if (!byProjectMap[projectKey]) {
                byProjectMap[projectKey] = { name: s.todo?.project?.name || 'No project', ms: 0 };
            }
            byProjectMap[projectKey].ms += ms;
        }

        const byDay = eachDayOfInterval({ start: from, end: to }).map((d) => {
            const key = format(d, 'yyyy-MM-dd');

            return { date: key, ms: byDayMap[key] || 0 };
        });

        // Календарных дней с активностью — для среднего за день по всей выборке.
        const workingDays = Object.values(byDayMap).filter((ms) => ms > 0).length;
        // Норма — сумма личных норм: (свои рабочие дни × свои часы) по каждому.
        const normMs = Object.values(normByUser).reduce((sum, n) => sum + n.days.size * n.workHours * 3600000, 0);

        return {
            totals: {
                totalMs,
                workingDays,
                avgPerDayMs: workingDays ? Math.round(totalMs / workingDays) : 0,
                overtimeMs: totalMs - normMs,
            },
            byDay,
            byProject: Object.entries(byProjectMap)
                .map(([projectId, v]) => ({
                    projectId: projectId === 'none' ? null : projectId,
                    name: v.name,
                    ms: v.ms,
                }))
                .sort((a, b) => b.ms - a.ms),
            logs: sessions.map((s) => ({
                id: s.id,
                userId: s.userId,
                userName: s.user?.name || null,
                start: s.createdAt.toISOString(),
                end: (s.active ? now : s.updatedAt).toISOString(),
                active: s.active,
                durationMs: durationOf(s),
                projectName: s.todo?.project?.name || null,
                todoName: s.todo?.name || null,
                todoStatus: (s.todo?.status as ETodoStatus) || ETodoStatus.TODO,
            })),
        };
    } catch (e) {
        logger.warn('Times stats/ get: ', e);
        throw e;
    }
});
