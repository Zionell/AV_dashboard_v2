import { dbClient } from '~~/lib/dbClient';
import type { ITaskComment } from '#shared/types/todo';

export default defineEventHandler(async (event): Promise<ITaskComment[]> => {
    try {
        const { todoId } = getQuery<{ todoId?: string }>(event);

        await requireTodoInScope(event, todoId);

        return await dbClient.todoComment.findMany({
            where: { todoId },
            include: { author: { select: { id: true, name: true, image: true } } },
            orderBy: { createdAt: 'asc' },
        });
    } catch (e) {
        logger.warn('Todo/comments get: ', e);
        throw e;
    }
});
