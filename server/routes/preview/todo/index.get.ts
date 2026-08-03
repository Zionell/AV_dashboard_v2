import { previewDb, previewPerson } from '~~/server/utils/preview/store';

// Копия GET /api/todo на моках: те же фильтры и форма ответа, но из памяти.
export default defineEventHandler((event) => {
    const db = previewDb();
    const query = getQuery(event);

    let items = db.todos.slice();

    if (query.executorId) items = items.filter((t) => t.executorId === query.executorId);
    if (query.projectId) items = items.filter((t) => t.projectId === query.projectId);
    if (query.status) items = items.filter((t) => t.status === query.status);

    const count = items.length;
    const take = Math.min(Number(query.take) || 20, 200);

    const results = items.slice(0, take).map((t) => {
        const project = db.projects.find((p) => p.id === t.projectId);

        return {
            ...t,
            project: project ? { id: project.id, name: project.name } : null,
            executor: previewPerson(t.executorId),
            author: previewPerson(t.authorId),
            loggedMs: 0,
            commentsCount: 0,
            attachmentsCount: 0,
        };
    });

    return { results, count };
});
