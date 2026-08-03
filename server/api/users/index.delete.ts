import { dbClient } from '~~/lib/dbClient';
import { EUserRole } from '#shared/types/user';

export default defineEventHandler(async (event) => {
    try {
        const user = requireApiUser(event);

        await dbClient.usersOnProjects.deleteMany({
            where: { userId: user.id },
        });

        // Задачи передаём другому владельцу компании; если его нет — удаляем.
        const fallbackOwner = user.companyId
            ? await dbClient.user.findFirst({
                  where: {
                      companyId: user.companyId,
                      role: EUserRole.OWNER,
                      id: { not: user.id },
                  },
                  select: { id: true },
              })
            : null;

        if (fallbackOwner) {
            await dbClient.todo.updateMany({
                where: { executorId: user.id },
                data: { executorId: fallbackOwner.id },
            });
        } else {
            await dbClient.todo.deleteMany({
                where: { executorId: user.id },
            });
        }

        await dbClient.user.delete({
            where: { id: user.id },
        });

        await clearUserSession(event);

        setResponseStatus(event, 204);
    } catch (e) {
        logger.warn('User/ delete: ', e);
        throw e;
    }
});
