import { dbClient } from '~~/lib/dbClient';

export default defineEventHandler(async (event) => {
    const user = requireApiUser(event);
    const id = getRouterParam(event, 'id');

    const { count } = await dbClient.times.updateMany({
        where: {
            id,
            userId: user.id,
        },
        data: {
            active: false,
        },
    });

    if (!count) throw createError({ statusCode: 404, message: 'Record not found' });

    setResponseStatus(event, 200);
});
