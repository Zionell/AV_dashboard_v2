import bcrypt from 'bcryptjs';
import { dbClient } from '~~/lib/dbClient';

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);

        const { id, ...rest } = body;

        if (!id) {
            throw createError({ statusCode: 404, statusMessage: 'User not found' });
        }

        if ('current' in rest) {
            const user = await dbClient.user.findUnique({
                where: {
                    id: id,
                },
            });

            if (!user) {
                throw createError({ statusCode: 404, statusMessage: 'User not found' });
            }
            const hash = user.hash || '';

            const isValid = await bcrypt.compare(rest.current, hash);

            if (!isValid) {
                throw createError({ statusCode: 401, statusMessage: 'Invalid password' });
            }
        }

        const newHash = await bcrypt.hash(rest.new, 10);

        await dbClient.user.update({
            where: {
                id: id,
            },
            data: {
                hash: newHash,
                hasPassword: true,
            },
        });

        return true;
    } catch (e) {
        console.warn('User update password / put: ', e);
        throw e;
    }
});
