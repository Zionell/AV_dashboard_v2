import { prisma } from '~~/server/utils/prisma';

export default defineEventHandler(async (event) => {
    const sessionUser = event.context.user;

    if (!sessionUser) throw createError({ statusCode: 401, message: 'Unauthorized' });

    const res = await prisma.user.findUnique({
        where: { id: sessionUser.id },
    });

    if (!res) throw createError({ statusCode: 401, message: 'Unauthorized' });

    const { hash: _, ...user } = res;

    return user;
});
