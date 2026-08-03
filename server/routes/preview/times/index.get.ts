import { previewDb } from '~~/server/utils/preview/store';

// Копия GET /api/times: сессии времени (с фильтром по датам).
export default defineEventHandler((event) => {
    const db = previewDb();
    const { from, to } = getQuery<{ from?: string; to?: string; userId?: string }>(event);

    return db.times
        .filter(
            (s) =>
                (from ? new Date(s.createdAt) >= new Date(from) : true) &&
                (to ? new Date(s.createdAt) <= new Date(to) : true)
        )
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
});
