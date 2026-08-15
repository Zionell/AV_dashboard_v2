import { startOfWeek } from 'date-fns';
import { prisma } from '~~/server/utils/prisma';
import { EUserRole } from '#shared/types/user';

type QueryType = {
    take: string;
    skip: string;
    order: SortType;
    q: string;
};

export default defineEventHandler(async (event) => {
    try {
        requireRole(event, EUserRole.OWNER, EUserRole.MANAGER);
        const companyId = requireCompanyId(event);
        const { take = '15', skip = '0', order = 'desc', q }: QueryType = getQuery(event);

        const users = await prisma.user.findMany({
            take: Number(take),
            skip: Number(skip),
            where: {
                companyId: companyId,
                name: {
                    contains: q,
                    mode: 'insensitive',
                },
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                name: order,
            },
        });
        const count = await prisma.user.count({
            where: {
                companyId: companyId,
            },
        });

        // Отработанное время за текущую неделю по пользователям страницы.
        const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
        const times = await prisma.times.findMany({
            where: {
                userId: { in: users.map((u) => u.id) },
                createdAt: { gte: weekStart },
            },
            select: { userId: true, createdAt: true, updatedAt: true, active: true },
        });

        const now = Date.now();
        const timeWeekByUser: Record<string, number> = {};
        for (const t of times) {
            const end = t.active ? now : t.updatedAt.getTime();
            timeWeekByUser[t.userId] = (timeWeekByUser[t.userId] || 0) + Math.max(0, end - t.createdAt.getTime());
        }

        const results = users.map((u) => ({
            ...u,
            timeWeekMs: timeWeekByUser[u.id] || 0,
        }));

        return { results, count };
    } catch (e) {
        logger.warn('User list/ get: ', e);
        throw e;
    }
});
