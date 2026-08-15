import { z } from 'zod';
import { prisma } from '~~/server/utils/prisma';
import { EProjectEventType } from '#shared/types/projects';

const bodySchema = z.object({
    todoId: z.string().min(1),
    text: z.string().trim().min(1, 'Comment cannot be empty').max(5000),
});

// Комментировать могут все участники проекта задачи.
export default defineEventHandler(async (event) => {
    try {
        const user = requireApiUser(event);
        const body = await readValidatedBody(event, bodySchema.parse);

        const todo = await requireTodoInScope(event, body.todoId);

        const comment = await prisma.todoComment.create({
            data: {
                text: body.text,
                todoId: body.todoId,
                authorId: user.id,
            },
            include: { author: { select: { id: true, name: true, image: true } } },
        });

        recordEvent(event, {
            type: EProjectEventType.COMMENT_ADDED,
            projectId: todo.projectId,
            actorId: user.id,
            targetName: todo.name,
        });

        setResponseStatus(event, 201);

        return comment;
    } catch (e) {
        logger.warn('Todo/comments post: ', e);
        throw e;
    }
});
