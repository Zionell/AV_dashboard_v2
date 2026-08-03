import { previewDb } from '~~/server/utils/preview/store';

const HOUR = 3_600_000;

// Копия GET /api/times/team: сводка по команде (детерминированные демо-часы).
export default defineEventHandler(() => {
    const db = previewDb();
    const sample = [
        { today: 2, week: 18, month: 72 },
        { today: 1.5, week: 14, month: 60 },
        { today: 0, week: 9, month: 40 },
        { today: 3, week: 22, month: 88 },
    ];

    return db.users.map((u, i) => {
        const s = sample[i] ?? { today: 0, week: 0, month: 0 };
        const weekMs = s.week * HOUR;

        return {
            userId: u.id,
            name: u.name,
            image: u.image,
            workHours: u.workHours,
            todayMs: s.today * HOUR,
            weekMs,
            monthMs: s.month * HOUR,
            overtimeMs: weekMs - 5 * u.workHours * HOUR,
        };
    });
});
