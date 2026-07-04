import { dbClient } from '~~/lib/dbClient';

export default defineEventHandler(async (event) => {
    try {
        const { id }: { id: string } = getQuery(event);

        await dbClient.user.delete({
            where: { id },
        });

        setCookie(event, 'auth_token', '', {
            maxAge: 0,
            path: '/',
        });
        setResponseStatus(event, 204);
    } catch (e) {
        console.warn('User/ delete: ', e);
        throw e;
    }
});
