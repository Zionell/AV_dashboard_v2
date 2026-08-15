import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '~~/server/utils/prisma';

const bodySchema = z.object({
    current: z.string().optional(),
    new: z.string().min(6, 'Password must be at least 6 characters'),
});

export default defineEventHandler(async (event) => {
    try {
        const sessionUser = requireApiUser(event);
        const body = await readValidatedBody(event, bodySchema.parse);

        const user = await prisma.user.findUnique({
            where: {
                id: sessionUser.id,
            },
        });

        if (!user) {
            throw createError({ statusCode: 404, statusMessage: 'User not found' });
        }

        if (user.hasPassword && user.hash) {
            const isValid = body.current ? await bcrypt.compare(body.current, user.hash) : false;

            if (!isValid) {
                throw createError({ statusCode: 401, statusMessage: 'Invalid password' });
            }
        }

        const newHash = await bcrypt.hash(body.new, 10);

        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                hash: newHash,
                hasPassword: true,
            },
        });

        return true;
    } catch (e) {
        logger.warn('User update password / put: ', e);
        throw e;
    }
});
