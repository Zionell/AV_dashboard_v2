import { dbClient } from '~~/lib/dbClient';
import { EUserRole } from '#shared/types/user';

interface IQuery {
    userId?: string;
    from?: string;
    to?: string;
}

export default defineEventHandler(async (event) => {
    try {
        const user = requireApiUser(event);
        const { userId, from, to }: IQuery = getQuery(event);

        let targetUserId = user.id;

        // OWNER — время любого сотрудника компании; MANAGER — только участников своих проектов.
        if (userId && userId !== user.id && hasRole(user, EUserRole.OWNER, EUserRole.MANAGER)) {
            const companyId = requireCompanyId(event);

            const target = hasRole(user, EUserRole.OWNER)
                ? await dbClient.user.findFirst({
                      where: { id: userId, companyId },
                      select: { id: true },
                  })
                : await dbClient.user.findFirst({
                      where: {
                          id: userId,
                          companyId,
                          projects: {
                              some: {
                                  project: {
                                      users: {
                                          some: {
                                              userId: user.id,
                                          },
                                      },
                                  },
                              },
                          },
                      },
                      select: { id: true },
                  });

            if (!target) throw createError({ statusCode: 404, message: 'Member not found' });

            targetUserId = target.id;
        }

        const createdAt =
            from || to
                ? {
                      ...(from ? { gte: new Date(from) } : {}),
                      ...(to ? { lte: new Date(to) } : {}),
                  }
                : undefined;

        const items = await dbClient.times.findMany({
            where: {
                userId: targetUserId,
                ...(createdAt ? { createdAt } : {}),
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        return items || [];
    } catch (e) {
        logger.warn('Times all/ get: ', e);
        throw e;
    }
});
