import { previewDb, previewPerson } from '~~/server/utils/preview/store';

// Копия GET /api/materials/[id]: карточка материала с категорией/проектом/автором.
export default defineEventHandler((event) => {
    const db = previewDb();
    const id = getRouterParam(event, 'id');
    const material = db.materials.find((m) => m.id === id);

    if (!material) throw createError({ statusCode: 404, message: 'Material not found' });

    const category = db.categories.find((c) => c.id === material.categoryId) || null;
    const project = material.projectId ? db.projects.find((p) => p.id === material.projectId) : null;

    return {
        ...material,
        description: '',
        createdAt: '2026-07-01T10:00:00.000Z',
        updatedAt: '2026-07-10T10:00:00.000Z',
        category,
        author: previewPerson(material.authorId),
        project: project ? { id: project.id, name: project.name } : null,
    };
});
