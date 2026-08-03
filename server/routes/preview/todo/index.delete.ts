import { previewDb } from '~~/server/utils/preview/store';

// Копия DELETE /api/todo?id=…: удаляем задачу и связанные комменты/вложения из памяти.
export default defineEventHandler((event) => {
    const db = previewDb();
    const { id } = getQuery<{ id?: string }>(event);

    db.todos = db.todos.filter((t) => t.id !== id);
    db.comments = db.comments.filter((c) => c.todoId !== id);
    db.attachments = db.attachments.filter((a) => a.todoId !== id);

    setResponseStatus(event, 204);

    return null;
});
