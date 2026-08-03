import { z } from 'zod';
import { dbClient } from '~~/lib/dbClient';

const bodySchema = z.object({
    name: z.string().trim().min(1).optional(),
    email: z.email().optional(),
    image: z.string().nullable().optional(),
    bio: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
});

export default defineEventHandler(async (event) => {
    try {
        const sessionUser = requireApiUser(event);
        const data = await readValidatedBody(event, bodySchema.parse);

        const updated = await dbClient.user.update({
            where: {
                id: sessionUser.id,
            },
            data,
        });

        const { hash: _, ...user } = updated;

        return user;
    } catch (e) {
        logger.warn('User update/ patch: ', e);
        throw e;
    }
});
