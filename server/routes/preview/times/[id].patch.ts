import { previewDb } from '~~/server/utils/preview/store';

// Копия PATCH /api/times/[id]: стоп сессии (в памяти).
export default defineEventHandler((event) => {
    const db = previewDb();
    const id = getRouterParam(event, 'id');
    const session = db.times.find((s) => s.id === id);

    if (!session) throw createError({ statusCode: 404, message: 'Session not found' });

    session.active = false;
    session.updatedAt = new Date().toISOString();

    return session;
});
