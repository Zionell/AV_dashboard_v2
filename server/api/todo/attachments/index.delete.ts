import { prisma } from '~~/server/utils/prisma';
import { EUserRole } from '#shared/types/user';

// Удаление вложений — только owner/manager (в рамках своих проектов).
export default defineEventHandler(async (event) => {
    try {
        requireRole(event, EUserRole.OWNER, EUserRole.MANAGER);

        const { id } = getQuery<{ id?: string }>(event);

        const attachment = id
            ? await prisma.todoAttachment.findFirst({
                  where: { id, todo: { project: projectScope(event) } },
                  select: { id: true },
              })
            : null;

        if (!attachment) throw createError({ statusCode: 404, message: 'Attachment not found' });

        await prisma.todoAttachment.delete({ where: { id: attachment.id } });

        setResponseStatus(event, 204);
    } catch (e) {
        logger.warn('Todo/attachments delete: ', e);
        throw e;
    }
});
