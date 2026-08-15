import { prisma } from '~~/server/utils/prisma';

export default defineEventHandler(async (event) => {
    try {
        const companyId = requireCompanyId(event);

        const items = await prisma.project.findMany({
            take: 10,
            where: {
                companyId,
            },
            select: {
                id: true,
                name: true,
            },
        });

        return items || [];
    } catch (e) {
        logger.warn('Projects specs/ get: ', e);
        throw e;
    }
});
