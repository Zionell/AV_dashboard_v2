import { previewDb, previewPerson } from '~~/server/utils/preview/store';

// Копия GET /api/todo/comments?todoId=…
export default defineEventHandler((event) => {
    const db = previewDb();
    const { todoId } = getQuery<{ todoId?: string }>(event);

    return db.comments.filter((c) => c.todoId === todoId).map((c) => ({ ...c, author: previewPerson(c.authorId) }));
});
