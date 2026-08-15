import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '~~/server/utils/prisma';

const bodySchema = z.object({
    email: z.email('Invalid email').transform((v) => v.toLowerCase()),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default defineEventHandler(async (event) => {
    const { email, password } = await readValidatedBody(event, bodySchema.parse);

    let user = await prisma.user.findUnique({ where: { email } });
    let isNew = false;

    if (!user) {
        const hash = await bcrypt.hash(password, 10);

        user = await prisma.user.create({
            data: {
                email,
                name: email.split('@')[0] ?? '',
                hash,
                hasPassword: true,
            },
        });
        isNew = true;
    } else {
        if (!user.hasPassword || !user.hash) {
            throw createError({
                statusCode: 401,
                message: 'This account has no password — sign in with Google',
            });
        }

        const isValid = await bcrypt.compare(password, user.hash);

        if (!isValid) {
            throw createError({ statusCode: 401, message: 'Invalid email or password' });
        }
    }

    await setUserSession(event, {
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
        },
    });

    return { onboarded: !isNew && Boolean(user.companyId) };
});
