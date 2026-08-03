import { dbClient } from '~~/lib/dbClient';
import { EUserRole } from '#shared/types/user';
import { EProjectEventType } from '#shared/types/projects';

export default defineEventHandler(async (event) => {
    try {
        const user = requireRole(event, EUserRole.OWNER, EUserRole.MANAGER);
        const { id }: { id: string } = getQuery(event);

        const existing = await dbClient.todo.findFirst({
            where: {
                id,
                project: projectScope(event),
            },
            select: { id: true, projectId: true, name: true },
        });

        if (!existing) throw createError({ statusCode: 404, message: 'Task not found' });

        await dbClient.todo.delete({ where: { id: existing.id } });

        recordEvent(event, {
            type: EProjectEventType.TASK_DELETED,
            projectId: existing.projectId,
            actorId: user.id,
            targetName: existing.name,
        });

        setResponseStatus(event, 204);
    } catch (e) {
        logger.warn('Todo/ delete: ', e);
        throw e;
    }
});
