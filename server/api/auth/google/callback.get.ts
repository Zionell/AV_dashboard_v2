import { prisma } from '~~/server/utils/prisma';

const googleHandler = defineOAuthGoogleEventHandler({
    config: {
        scope: ['openid', 'email', 'profile'],
    },
    async onSuccess(event, { user: googleUser }) {
        let user = await prisma.user.findUnique({
            where: { email: googleUser.email },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: googleUser.email,
                    name: googleUser.name ?? googleUser.email.split('@')[0] ?? '',
                    image: googleUser.picture ?? null,
                },
            });
        }

        await setUserSession(event, {
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        });

        return sendRedirect(event, user.companyId ? '/dashboard' : '/login/new');
    },
    onError(event, error) {
        logger.error('Google OAuth error: ', error);

        return sendRedirect(event, '/');
    },
});

export default defineEventHandler(async (event) => {
    try {
        return await googleHandler(event);
    } catch (e) {
        logger.error('Google OAuth error: ', e);

        return sendRedirect(event, '/');
    }
});
