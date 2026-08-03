import { previewDb, previewId, previewPerson, type PreviewComment } from '~~/server/utils/preview/store';

// Копия POST /api/todo/comments
export default defineEventHandler(async (event) => {
    const db = previewDb();
    const body = await readBody(event);
    const now = new Date().toISOString();

    const comment: PreviewComment = {
        id: previewId('cm'),
        text: body.text,
        todoId: body.todoId,
        authorId: db.user.id,
        createdAt: now,
        updatedAt: now,
    };

    db.comments.push(comment);

    return { ...comment, author: previewPerson(comment.authorId) };
});
