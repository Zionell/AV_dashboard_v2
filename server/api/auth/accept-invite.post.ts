import { z } from 'zod';
import { prisma } from '~~/server/utils/prisma';
import { EUserRole } from '#shared/types/user';

const bodySchema = z.object({
    token: z.string().min(1),
});

/**
 * Принятие приглашения: привязывает вошедшего пользователя к компании и переносит
 * заданную пригласившим норму часов. Вызывается со страницы входа, когда в адресе
 * есть ?token=… — то есть уже после логина/регистрации.
 */
export default defineEventHandler(async (event) => {
    try {
        const { user: sessionUser } = await requireUserSession(event);
        const { token } = await readValidatedBody(event, bodySchema.parse);

        const current = await prisma.user.findUnique({
            where: { id: sessionUser.id },
            select: { id: true, email: true, companyId: true },
        });

        if (!current) throw createError({ statusCode: 401, message: 'Unauthorized' });
        if (current.companyId) {
            throw createError({ statusCode: 400, message: 'You already belong to a company' });
        }

        const invitation = await prisma.invitation.findUnique({ where: { token } });

        // Одна формулировка на все случаи: не подсказываем, существует ли токен вообще.
        if (!invitation || invitation.acceptedAt || invitation.expiresAt < new Date()) {
            throw createError({ statusCode: 400, message: 'This invitation is no longer valid' });
        }

        // Ссылка именная: иначе переслав письмо, в компанию зашёл бы кто угодно.
        if (invitation.email.toLowerCase() !== current.email.toLowerCase()) {
            throw createError({ statusCode: 400, message: 'This invitation was sent to a different email' });
        }

        // Между отправкой и принятием места могли занять — проверяем повторно.
        await assertSeatAvailable(invitation.companyId);

        const updated = await prisma.user.update({
            where: { id: current.id },
            data: {
                companyId: invitation.companyId,
                workHours: invitation.workHours,
                role: EUserRole.EMPLOYEE,
            },
        });

        await prisma.invitation.update({
            where: { id: invitation.id },
            data: { acceptedAt: new Date() },
        });

        await replaceUserSession(event, {
            user: { id: updated.id, email: updated.email, role: updated.role },
        });

        return { ok: true };
    } catch (e) {
        logger.warn('Auth/accept-invite post: ', e);
        throw e;
    }
});
