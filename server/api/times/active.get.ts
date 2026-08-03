import { dbClient } from '~~/lib/dbClient';

export default defineEventHandler(async (event) => {
    try {
        const user = requireApiUser(event);

        const items = await dbClient.times.findMany({
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
