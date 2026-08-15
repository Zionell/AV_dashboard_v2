import { prisma } from '~~/server/utils/prisma';
import { EUserRole } from '#shared/types/user';

export default defineEventHandler(async (event) => {
    try {
        requireRole(event, EUserRole.OWNER, EUserRole.MANAGER);
        const companyId = requireCompanyId(event);
        const { search }: { search: string } = getQuery(event);

        const users = await prisma.user.findMany({
            take: 10,
            skip: 0,
            where: {
                companyId: companyId,
                name: {
                    contains: search,
                },
            },
            select: {
                id: true,
                name: true,
                role: true,
            },
        });

        return users || [];
    } catch (e) {
        logger.warn('User search/ get: ', e);
        throw e;
    }
});
