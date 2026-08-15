import { prisma } from '~~/server/utils/prisma';

export default defineEventHandler(async (event) => {
    try {
        const user = requireApiUser(event);

        if (!user.companyId) return null;

        const company = await prisma.company.findUnique({
            where: { id: user.companyId },
            include: {
                users: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        role: true,
                    },
                },
            },
        });

        return company || null;
    } catch (e) {
        logger.warn('Company/ get: ', e);
        throw e;
    }
});
