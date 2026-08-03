import { previewDb } from '~~/server/utils/preview/store';

// Копия DELETE /api/todo/comments?id=…
export default defineEventHandler((event) => {
    const db = previewDb();
    const { id } = getQuery<{ id?: string }>(event);

    db.comments = db.comments.filter((c) => c.id !== id);
    setResponseStatus(event, 204);

    return null;
});
