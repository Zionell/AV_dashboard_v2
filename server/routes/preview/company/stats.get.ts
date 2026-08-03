import { previewDb } from '~~/server/utils/preview/store';

const HOUR = 3_600_000;

// Копия GET /api/company/stats — сводка компании на моках.
export default defineEventHandler(() => {
    const db = previewDb();

    const byRole: Record<string, number> = {};

    for (const u of db.users) byRole[u.role] = (byRole[u.role] || 0) + 1;

    const items = db.projects.map((p) => {
        const tasks = db.todos.filter((t) => t.projectId === p.id);
        const completed = tasks.filter((t) => t.isCompleted).length;

        return {
            id: p.id,
            name: p.name,
            totalTodos: tasks.length,
            completedTodos: completed,
            members: 3,
            isClosed: tasks.length > 0 && completed === tasks.length,
        };
    });

    return {
        members: { total: db.users.length, newThisMonth: 1, byRole },
        projects: {
            active: items.filter((i) => !i.isClosed).length,
            closed: items.filter((i) => i.isClosed).length,
            items,
        },
        tasks: { inProgress: db.todos.filter((t) => t.status === 'IN_PROGRESS').length },
        time: {
            todayMs: 8 * HOUR,
            yesterdayMs: 12 * HOUR,
            weekMs: 96 * HOUR,
            lastWeekMs: 88 * HOUR,
            monthMs: 320 * HOUR,
            lastMonthMs: 300 * HOUR,
            avgPerMemberWeekMs: 24 * HOUR,
        },
    };
});
