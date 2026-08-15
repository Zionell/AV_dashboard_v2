import { prisma } from '~~/server/utils/prisma';
import type { ITaskAttachmentFull } from '#shared/types/todo';

// Содержимое одного вложения. Список (index.get) отдаёт только метаданные,
// сюда ходим лениво — когда пользователь реально открывает картинку.
export default defineEventHandler(async (event): Promise<ITaskAttachmentFull> => {
    try {
        requireApiUser(event);

        const id = getRouterParam(event, 'id');

        const attachment = id
            ? await prisma.todoAttachment.findFirst({
                  where: { id, todo: { project: projectScope(event) } },
                  select: {
                      id: true,
                      name: true,
                      data: true,
                      todoId: true,
                      createdAt: true,
                      author: { select: { id: true, name: true, image: true } },
                  },
              })
            : null;

        if (!attachment) throw createError({ statusCode: 404, message: 'Attachment not found' });

        return attachment;
    } catch (e) {
        logger.warn('Todo/attachments [id] get: ', e);
        throw e;
    }
});
