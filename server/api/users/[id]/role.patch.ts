import { z } from 'zod';
import { prisma } from '~~/server/utils/prisma';
import { ASSIGNABLE_ROLES, EUserRole } from '#shared/types/user';

// Список ролей общий с интерфейсом: демо-роль TEST выдать нельзя ни отсюда, ни оттуда.
const bodySchema = z.object({
    role: z.enum(ASSIGNABLE_ROLES),
});

export default defineEventHandler(async (event) => {
    try {
        const actor = requireRole(event, EUserRole.OWNER);
        const companyId = requireCompanyId(event);
        const id = getRouterParam(event, 'id');
        const { role } = await readValidatedBody(event, bodySchema.parse);

        const target = await prisma.user.findFirst({
            where: { id, companyId },
            select: { id: true, role: true },
        });

        if (!target) throw createError({ statusCode: 404, message: 'Member not found' });

        // Нельзя оставить компанию без владельца.
        if (target.role === EUserRole.OWNER && role !== EUserRole.OWNER) {
            const owners = await prisma.user.count({
                where: { companyId, role: EUserRole.OWNER },
            });

            if (owners <= 1) {
                throw createError({ statusCode: 400, message: 'The company must have at least one owner' });
            }
        }

        const updated = await prisma.user.update({
            where: { id: target.id },
            data: { role },
            select: { id: true, name: true, email: true, role: true },
        });

        // Если owner понизил сам себя — обновляем его сессию.
        if (actor.id === target.id) {
            await replaceUserSession(event, {
                user: { id: actor.id, email: actor.email, role },
            });
        }

        return updated;
    } catch (e) {
        logger.warn('User role/ patch: ', e);
        throw e;
    }
});
