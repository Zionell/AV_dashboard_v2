import { previewDb } from '~~/server/utils/preview/store';

// Копия PATCH /api/users/me: правка своего профиля в памяти.
export default defineEventHandler(async (event) => {
    const db = previewDb();
    const body = await readBody(event);

    for (const key of ['name', 'bio', 'image'] as const) {
        if (body[key] !== undefined) (db.user as unknown as Record<string, unknown>)[key] = body[key];
    }

    return db.user;
});
