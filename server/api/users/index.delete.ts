import { prisma } from '~~/server/utils/prisma';
import { EUserRole } from '#shared/types/user';

export default defineEventHandler(async (event) => {
    try {
        const user = requireApiUser(event);

        await prisma.usersOnProjects.deleteMany({
            where: { userId: user.id },
        });

        // Задачи передаём другому владельцу компании; если его нет — удаляем.
        const fallbackOwner = user.companyId
            ? await prisma.user.findFirst({
                  where: {
                      companyId: user.companyId,
                      role: EUserRole.OWNER,
                      id: { not: user.id },
                  },
                  select: { id: true },
              })
            : null;

        if (fallbackOwner) {
            await prisma.todo.updateMany({
                where: { executorId: user.id },
                data: { executorId: fallbackOwner.id },
            });
        } else {
            await prisma.todo.deleteMany({
                where: { executorId: user.id },
            });
        }

        await prisma.user.delete({
            where: { id: user.id },
        });

        await clearUserSession(event);

        setResponseStatus(event, 204);
    } catch (e) {
        logger.warn('User/ delete: ', e);
        throw e;
    }
});
