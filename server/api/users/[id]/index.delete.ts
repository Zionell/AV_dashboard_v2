import { prisma } from '~~/server/utils/prisma';
import { EUserRole } from '#shared/types/user';

export default defineEventHandler(async (event) => {
    try {
        const actor = requireRole(event, EUserRole.OWNER);
        const companyId = requireCompanyId(event);
        const id = getRouterParam(event, 'id');

        if (id === actor.id) {
            throw createError({ statusCode: 400, message: 'To delete your own account, use profile settings' });
        }

        const target = await prisma.user.findFirst({
            where: { id, companyId },
            select: { id: true },
        });

        if (!target) throw createError({ statusCode: 404, message: 'Member not found' });

        // Порядок важен: сначала отвязываем от проектов и переназначаем задачи, потом удаляем (times уйдут каскадом).
        await prisma.usersOnProjects.deleteMany({
            where: { userId: target.id },
        });
        await prisma.todo.updateMany({
            where: { executorId: target.id },
            data: { executorId: actor.id },
        });
        await prisma.user.delete({
            where: { id: target.id },
        });

        setResponseStatus(event, 204);
    } catch (e) {
        logger.warn('User member/ delete: ', e);
        throw e;
    }
});
