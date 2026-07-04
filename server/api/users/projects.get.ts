import { dbClient } from '~~/lib/dbClient';

export default defineEventHandler(async (event) => {
    try {
        const { companyId }: { companyId: string; userId: string } = getQuery(event);

        return await dbClient.user.findMany({
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
        console.warn('User list/ get: ', e);
        throw e;
    }
});
