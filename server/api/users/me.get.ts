import jwt, { type JwtPayload } from 'jsonwebtoken';
import { dbClient } from '~~/lib/dbClient';

export default defineEventHandler(async (event) => {
    try {
        const runtimeConfig = useRuntimeConfig();
        const jwtSecret = runtimeConfig.JWT_SALT;
        const cookies = parseCookies(event);

        if (!cookies?.auth_token) throw createError({ statusCode: 401, message: 'Unauthorized' });

        const decoded = jwt.verify(cookies.auth_token, jwtSecret) as JwtPayload;

        if (!decoded?.id) throw createError({ statusCode: 401, message: 'Unauthorized' });

        const res = await dbClient.user.findUnique({
            where: { id: decoded.id },
        });

        if (!res) throw createError({ statusCode: 401, message: 'Unauthorized' });

        const { hash: _, ...user } = res;

        return user;
    } catch (e) {
        throw e;
    }
});
