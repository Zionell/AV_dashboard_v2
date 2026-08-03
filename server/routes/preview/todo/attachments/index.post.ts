import { previewDb, previewId, previewPerson, type PreviewAttachment } from '~~/server/utils/preview/store';

// Копия POST /api/todo/attachments — кладём base64 в память, отдаём метаданные.
export default defineEventHandler(async (event) => {
    const db = previewDb();
    const body = await readBody(event);

    const attachment: PreviewAttachment = {
        id: previewId('at'),
        name: body.name,
        todoId: body.todoId,
        authorId: db.user.id,
        data: body.data,
        createdAt: new Date().toISOString(),
    };

    db.attachments.push(attachment);
    setResponseStatus(event, 201);

    return {
        id: attachment.id,
        name: attachment.name,
        todoId: attachment.todoId,
        createdAt: attachment.createdAt,
        author: previewPerson(attachment.authorId),
    };
});
