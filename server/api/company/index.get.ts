import { dbClient } from '~~/lib/dbClient';

export default defineEventHandler(async (event) => {
    try {
        const user = requireApiUser(event);

        if (!user.companyId) return null;

        const company = await dbClient.company.findUnique({
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
