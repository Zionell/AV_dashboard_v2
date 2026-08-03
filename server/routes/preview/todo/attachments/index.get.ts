import { previewDb, previewPerson } from '~~/server/utils/preview/store';

// Копия GET /api/todo/attachments?todoId=… — только метаданные, без base64.
export default defineEventHandler((event) => {
    const db = previewDb();
    const { todoId } = getQuery<{ todoId?: string }>(event);

    return db.attachments
        .filter((a) => a.todoId === todoId)
        .map((a) => ({
            id: a.id,
            name: a.name,
            todoId: a.todoId,
            createdAt: a.createdAt,
            author: previewPerson(a.authorId),
        }));
});
