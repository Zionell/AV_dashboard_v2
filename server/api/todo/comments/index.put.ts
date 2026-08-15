import { z } from 'zod';
import { prisma } from '~~/server/utils/prisma';
import { EUserRole } from '#shared/types/user';

const bodySchema = z.object({
    text: z.string().trim().min(1, 'Comment cannot be empty').max(5000),
});

// Редактирование комментариев — только owner/manager (в рамках своих проектов).
export default defineEventHandler(async (event) => {
    try {
        requireRole(event, EUserRole.OWNER, EUserRole.MANAGER);

        const { id } = getQuery<{ id?: string }>(event);
        const body = await readValidatedBody(event, bodySchema.parse);

        const comment = id
            ? await prisma.todoComment.findFirst({
                  where: { id, todo: { project: projectScope(event) } },
                  select: { id: true },
              })
            : null;

        if (!comment) throw createError({ statusCode: 404, message: 'Comment not found' });

        return await prisma.todoComment.update({
            where: { id: comment.id },
            data: { text: body.text },
            include: { author: { select: { id: true, name: true, image: true } } },
        });
    } catch (e) {
        logger.warn('Todo/comments put: ', e);
        throw e;
    }
});
