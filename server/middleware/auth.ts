import { dbClient } from '~~/lib/dbClient';

export default defineEventHandler(async (event) => {
    const path = event.path;

    if (!path.startsWith('/api/')) return;
    if (path.startsWith('/api/auth/') || path.startsWith('/api/_auth/')) return;

    const { user: sessionUser } = await requireUserSession(event);

    const user = await dbClient.user.findUnique({
        where: { id: sessionUser.id },
        select: { id: true, email: true, role: true, companyId: true },
    });

    if (!user) {
        await clearUserSession(event);
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    event.context.user = user;
});
