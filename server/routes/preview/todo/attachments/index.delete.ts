import { previewDb } from '~~/server/utils/preview/store';

// Копия DELETE /api/todo/attachments?id=…
export default defineEventHandler((event) => {
    const db = previewDb();
    const { id } = getQuery<{ id?: string }>(event);

    db.attachments = db.attachments.filter((a) => a.id !== id);
    setResponseStatus(event, 204);

    return null;
});
