import { prisma } from '~~/server/utils/prisma';

export default defineEventHandler(async (event) => {
    try {
        const user = requireApiUser(event);

        const items = await prisma.times.findMany({
            where: {
                userId: user.id,
                active: true,
            },
        });

        return items || [];
    } catch (e) {
        logger.warn('Times active/ get: ', e);
        throw e;
    }
});
