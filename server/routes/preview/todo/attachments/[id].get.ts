import { previewDb, previewPerson } from '~~/server/utils/preview/store';

// Копия GET /api/todo/attachments/[id] — полное вложение с base64.
export default defineEventHandler((event) => {
    const db = previewDb();
    const id = getRouterParam(event, 'id');
    const attachment = db.attachments.find((a) => a.id === id);

    if (!attachment) throw createError({ statusCode: 404, message: 'Attachment not found' });

    return { ...attachment, author: previewPerson(attachment.authorId) };
});
