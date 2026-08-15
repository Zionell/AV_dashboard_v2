import { prisma } from '~~/server/utils/prisma';
import { EUserRole } from '#shared/types/user';
import type { MaterialSortKey } from '#shared/types/material';

interface IQuery {
    q?: string;
    categoryId?: string;
    projectId?: string;
    sort?: MaterialSortKey;
    take?: string;
    skip?: string;
}

const orderByMap = {
    newest: { createdAt: 'desc' },
    oldest: { createdAt: 'asc' },
    updated: { updatedAt: 'desc' },
    alpha: { name: 'asc' },
} as const;

export default defineEventHandler(async (event) => {
    try {
        const user = requireApiUser(event);
        const companyId = requireCompanyId(event);
        const { q, categoryId, projectId, sort = 'newest', take = '24', skip = '0' }: IQuery = getQuery(event);

        const scope = hasRole(user, EUserRole.OWNER)
            ? { companyId }
            : {
                  companyId,
                  OR: [
                      { projectId: null },
                      { projectId: { isSet: false } },
                      {
                          project: {
                              users: {
                                  some: {
                                      userId: user.id,
                                  },
                              },
                          },
                      },
                  ],
              };

        const where = {
            AND: [
                scope,
                ...(q ? [{ name: { contains: q, mode: 'insensitive' as const } }] : []),
                ...(categoryId ? [{ categoryId }] : []),
                ...(projectId ? [{ projectId }] : []),
            ],
        };

        const [results, count] = await Promise.all([
            prisma.material.findMany({
                take: Number(take),
                skip: Number(skip),
                where,
                include: {
                    category: true,
                    project: { select: { id: true, name: true } },
                },
                orderBy: orderByMap[sort] || orderByMap.newest,
            }),
            prisma.material.count({ where }),
        ]);

        return { results, count };
    } catch (e) {
        logger.warn('Material/ get: ', e);
        throw e;
    }
});
