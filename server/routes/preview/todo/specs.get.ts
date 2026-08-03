import { previewDb } from '~~/server/utils/preview/store';

// Копия GET /api/todo/specs: задачи «в работе» для выбора при старте сессии.
export default defineEventHandler(() =>
    previewDb()
        .todos.filter((t) => t.status === 'IN_PROGRESS')
        .map((t) => ({ id: t.id, name: t.name, status: t.status, projectId: t.projectId }))
);
