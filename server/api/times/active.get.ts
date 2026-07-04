import { dbClient } from '~~/lib/dbClient';

export default defineEventHandler(async (event) => {
    try {
        const { userId }: { userId: string } = getQuery(event);

        const items = await dbClient.times.findMany({
            where: {
                userId,
                active: true,
            },
        });

        return items || [];
    } catch (e) {
        console.warn('Times active/ get: ', e);
        throw e;
    }
});
