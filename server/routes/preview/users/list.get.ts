import { previewDb } from '~~/server/utils/preview/store';

const HOUR = 3_600_000;

// Копия GET /api/users/list: участники компании с недельным временем.
export default defineEventHandler(() => {
    const db = previewDb();
    const week = [18, 14, 9, 22];

    const results = db.users.map((u, i) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        image: u.image,
        role: u.role,
        createdAt: '2026-06-01T10:00:00.000Z',
        updatedAt: '2026-07-01T10:00:00.000Z',
        timeWeekMs: (week[i] ?? 0) * HOUR,
    }));

    return { results, count: results.length };
});
