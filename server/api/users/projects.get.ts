import { prisma } from '~~/server/utils/prisma';
import { EUserRole } from '#shared/types/user';

export default defineEventHandler(async (event) => {
    try {
        requireRole(event, EUserRole.OWNER, EUserRole.MANAGER);
        const companyId = requireCompanyId(event);

        return await prisma.user.findMany({
            where: {
                companyId: companyId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });
    } catch (e) {
        logger.warn('User list/ get: ', e);
        throw e;
    }
});
