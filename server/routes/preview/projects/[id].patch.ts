import { previewDb } from '~~/server/utils/preview/store';

// Копия PATCH /api/projects/[id]: правка проекта в памяти.
export default defineEventHandler(async (event) => {
    const db = previewDb();
    const id = getRouterParam(event, 'id');
    const body = await readBody(event);
    const project = db.projects.find((p) => p.id === id);

    if (!project) throw createError({ statusCode: 404, message: 'Project not found' });

    for (const key of ['name', 'description', 'client', 'priority', 'links'] as const) {
        if (body[key] !== undefined) (project as unknown as Record<string, unknown>)[key] = body[key];
    }

    return project;
});
