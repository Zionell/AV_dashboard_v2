import { dbClient } from '~~/lib/dbClient';

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);

        const { id, ...rest } = body;

        if (!id) {
            throw createError({ statusCode: 404, statusMessage: 'User not found' });
        }

        return await dbClient.user.update({
            where: {
                id: id,
            },
            data: {
                ...rest,
            },
        });
    } catch (e) {
        console.warn('User update/ patch: ', e);
        throw e;
    }
});
