import { previewDb } from '~~/server/utils/preview/store';

// Копия GET /api/projects: проекты + флаги выполненности задач для прогресса.
export default defineEventHandler(() => {
    const db = previewDb();

    const results = db.projects.map((p) => ({
        ...p,
        todo: db.todos.filter((t) => t.projectId === p.id).map((t) => ({ isCompleted: t.isCompleted })),
    }));

    return { results, count: results.length };
});
