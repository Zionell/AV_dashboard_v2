import { dbClient } from '~~/lib/dbClient';
import { EUserRole } from '#shared/types/user';

export default defineEventHandler(async (event) => {
    try {
        requireRole(event, EUserRole.OWNER, EUserRole.MANAGER);
        const companyId = requireCompanyId(event);
        const { search }: { search: string } = getQuery(event);

        const users = await dbClient.user.findMany({
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
