import { dbClient } from '~~/lib/dbClient';
import { EUserRole } from '#shared/types/user';

// Удаление комментариев — только owner/manager (в рамках своих проектов).
export default defineEventHandler(async (event) => {
    try {
        requireRole(event, EUserRole.OWNER, EUserRole.MANAGER);

        const { id } = getQuery<{ id?: string }>(event);

        const comment = id
            ? await dbClient.todoComment.findFirst({
                  where: { id, todo: { project: projectScope(event) } },
                  select: { id: true },
              })
            : null;

        if (!comment) throw createError({ statusCode: 404, message: 'Comment not found' });

        await dbClient.todoComment.delete({ where: { id: comment.id } });

        setResponseStatus(event, 204);
    } catch (e) {
        logger.warn('Todo/comments delete: ', e);
        throw e;
    }
});
