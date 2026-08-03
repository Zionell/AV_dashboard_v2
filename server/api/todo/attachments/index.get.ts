import { dbClient } from '~~/lib/dbClient';
import type { ITaskAttachment } from '#shared/types/todo';

export default defineEventHandler(async (event): Promise<ITaskAttachment[]> => {
    try {
        const { todoId } = getQuery<{ todoId?: string }>(event);

        await requireTodoInScope(event, todoId);

        // select без `data`: содержимое отдаётся поштучно через /api/todo/attachments/[id],
        // иначе открытие задачи с несколькими картинками тянет мегабайты base64.
        return await dbClient.todoAttachment.findMany({
            where: { todoId },
            select: {
                id: true,
                name: true,
                todoId: true,
                createdAt: true,
                author: { select: { id: true, name: true, image: true } },
            },
            orderBy: { createdAt: 'asc' },
        });
    } catch (e) {
        logger.warn('Todo/attachments get: ', e);
        throw e;
    }
});
