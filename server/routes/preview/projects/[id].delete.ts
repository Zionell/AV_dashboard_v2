import { previewDb } from '~~/server/utils/preview/store';

// Копия DELETE /api/projects/[id]: удаляем проект и его задачи из памяти.
export default defineEventHandler((event) => {
    const db = previewDb();
    const id = getRouterParam(event, 'id');

    db.projects = db.projects.filter((p) => p.id !== id);
    db.todos = db.todos.filter((t) => t.projectId !== id);

    setResponseStatus(event, 204);

    return null;
});
