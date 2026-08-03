import { previewDb, previewId, type PreviewProject } from '~~/server/utils/preview/store';

// Копия POST /api/projects: создаём проект в памяти демо-стора.
export default defineEventHandler(async (event) => {
    const db = previewDb();
    const body = await readBody(event);

    const project: PreviewProject = {
        id: previewId('dp'),
        name: body.name,
        description: body.description || '',
        client: body.client || '',
        priority: body.priority ?? 2,
        companyId: db.company.id,
        links: body.links || [],
    };

    db.projects.push(project);
    setResponseStatus(event, 201);

    return project;
});
