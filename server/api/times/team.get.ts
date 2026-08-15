import { format, startOfDay, startOfMonth, startOfWeek } from 'date-fns';
import { prisma } from '~~/server/utils/prisma';
import { EUserRole } from '#shared/types/user';
import type { ITeamSummaryRow } from '#shared/types/times';

export default defineEventHandler(async (event): Promise<ITeamSummaryRow[]> => {
    try {
        const user = requireRole(event, EUserRole.OWNER, EUserRole.MANAGER);
        const companyId = requireCompanyId(event);

        // Owner — вся компания; manager — участники его проектов.
        let members;

        if (hasRole(user, EUserRole.OWNER)) {
            members = await prisma.user.findMany({
                where: { companyId },
                select: { id: true, name: true, image: true, workHours: true },
            });
        } else {
            const own = await prisma.usersOnProjects.findMany({
                where: { userId: user.id },
                select: { projectId: true },
            });
            const links = await prisma.usersOnProjects.findMany({
                where: { projectId: { in: own.map((p) => p.projectId) } },
                select: { userId: true },
            });
            const ids = [...new Set([user.id, ...links.map((l) => l.userId)])];

            members = await prisma.user.findMany({
                where: { id: { in: ids }, companyId },
                select: { id: true, name: true, image: true, workHours: true },
            });
        }

        const now = new Date();
        const dayStart = startOfDay(now);
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const monthStart = startOfMonth(now);

        const sessions = await prisma.times.findMany({
            where: {
                userId: { in: members.map((m) => m.id) },
                createdAt: { gte: monthStart },
            },
            select: { userId: true, createdAt: true, updatedAt: true, active: true },
        });

        const acc: Record<string, { todayMs: number; weekMs: number; monthMs: number; days: Set<string> }> = {};

        for (const s of sessions) {
            const ms = Math.max(0, (s.active ? now : s.updatedAt).getTime() - s.createdAt.getTime());
            const a = (acc[s.userId] ||= { todayMs: 0, weekMs: 0, monthMs: 0, days: new Set() });

            a.monthMs += ms;
            a.days.add(format(s.createdAt, 'yyyy-MM-dd'));
            if (s.createdAt >= weekStart) a.weekMs += ms;
            if (s.createdAt >= dayStart) a.todayMs += ms;
        }

        return members
            .map((m) => {
                const a = acc[m.id];
                // Норма у каждого своя — задаётся при приглашении, лежит в User.workHours.
                const normMs = (a?.days.size || 0) * m.workHours * 3600000;

                return {
                    userId: m.id,
                    name: m.name,
                    image: m.image,
                    workHours: m.workHours,
                    todayMs: a?.todayMs || 0,
                    weekMs: a?.weekMs || 0,
                    monthMs: a?.monthMs || 0,
                    overtimeMs: (a?.monthMs || 0) - normMs,
                };
            })
            .sort((a, b) => b.monthMs - a.monthMs);
    } catch (e) {
        logger.warn('Times team/ get: ', e);
        throw e;
    }
});
