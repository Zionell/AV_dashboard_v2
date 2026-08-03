import { dbClient } from '~~/lib/dbClient';

export default defineEventHandler(async (event) => {
    const sessionUser = event.context.user;

    if (!sessionUser) throw createError({ statusCode: 401, message: 'Unauthorized' });

    const res = await dbClient.user.findUnique({
        where: { id: sessionUser.id },
    });

    if (!res) throw createError({ statusCode: 401, message: 'Unauthorized' });

    const { hash: _, ...user } = res;

    return user;
});
