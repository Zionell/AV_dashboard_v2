import { previewDb, previewPerson } from '~~/server/utils/preview/store';

// Копия PUT /api/todo/comments?id=…
export default defineEventHandler(async (event) => {
    const db = previewDb();
    const { id } = getQuery<{ id?: string }>(event);
    const body = await readBody(event);
    const comment = db.comments.find((c) => c.id === id);

    if (!comment) throw createError({ statusCode: 404, message: 'Comment not found' });

    comment.text = body.text;
    comment.updatedAt = new Date().toISOString();

    return { ...comment, author: previewPerson(comment.authorId) };
});
