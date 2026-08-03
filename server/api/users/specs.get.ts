import { dbClient } from '~~/lib/dbClient';
import { EUserRole, type IUserSpec } from '#shared/types/user';

export default defineEventHandler(async (event): Promise<IUserSpec[]> => {
    try {
        requireRole(event, EUserRole.OWNER, EUserRole.MANAGER);
        const companyId = requireCompanyId(event);

        const items = await dbClient.user.findMany({
            take: 14,
            where: {
                companyId: companyId,
            },
            select: {
                id: true,
                name: true,
            },
        });

        return items || [];
    } catch (e) {
        logger.warn('Users specs/ get: ', e);
        throw e;
    }
});
