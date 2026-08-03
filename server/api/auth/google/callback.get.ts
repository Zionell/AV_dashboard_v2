import { randomUUID } from 'node:crypto';
import { dbClient } from '~~/lib/dbClient';

const STATE_COOKIE = 'oauth_state';

const googleHandler = defineOAuthGoogleEventHandler({
    config: {
        scope: ['openid', 'email', 'profile'],
    },
    async onSuccess(event, { user: googleUser }) {
        let user = await dbClient.user.findUnique({
            where: { email: googleUser.email },
        });

        if (!user) {
            user = await dbClient.user.create({
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
    const query = getQuery(event);

    // Шаг 1: вход в флоу — выдаём одноразовый state в httpOnly-cookie.
    // sameSite: 'lax', потому что возврат от Google — кросс-сайтовая top-level навигация.
    if (!query.code && !query.error && !query.state) {
        const state = randomUUID();

        setCookie(event, STATE_COOKIE, state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 10,
        });

        return sendRedirect(event, `${event.path}?state=${state}`);
    }

    // Шаг 2: возврат от Google — сверяем state с cookie.
    if (query.code || query.error) {
        const cookieState = getCookie(event, STATE_COOKIE);

        deleteCookie(event, STATE_COOKIE);

        if (!cookieState || query.state !== cookieState) {
            throw createError({ statusCode: 403, message: 'Invalid OAuth state' });
        }
    }

    try {
        return await googleHandler(event);
    } catch (e) {
        // Модуль не перехватывает ошибки обмена кода на токен — не показываем голую 400.
        logger.error('Google OAuth error: ', e);
        return sendRedirect(event, '/');
    }
});
