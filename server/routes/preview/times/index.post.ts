import { previewDb, previewId, type PreviewTimes } from '~~/server/utils/preview/store';

// Копия POST /api/times: старт сессии таймера (в памяти).
export default defineEventHandler(async (event) => {
    const db = previewDb();
    const body = await readBody(event);
    const now = new Date().toISOString();

    const session: PreviewTimes = {
        id: previewId('tm'),
        userId: db.user.id,
        projectId: body.projectId ?? null,
        todoId: body.todoId ?? null,
        active: true,
        createdAt: now,
        updatedAt: now,
    };

    db.times.push(session);
    setResponseStatus(event, 201);

    return session;
});
