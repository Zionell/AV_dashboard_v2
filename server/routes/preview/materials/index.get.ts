import { previewDb, previewPerson } from '~~/server/utils/preview/store';

const decorate = (m: ReturnType<typeof previewDb>['materials'][number], db: ReturnType<typeof previewDb>) => {
    const category = db.categories.find((c) => c.id === m.categoryId) || null;
    const project = m.projectId ? db.projects.find((p) => p.id === m.projectId) : null;

    return {
        ...m,
        createdAt: '2026-07-01T10:00:00.000Z',
        updatedAt: '2026-07-10T10:00:00.000Z',
        category,
        author: previewPerson(m.authorId),
        project: project ? { id: project.id, name: project.name } : null,
    };
};

// Копия GET /api/materials: список с фильтрами по поиску/категории.
export default defineEventHandler((event) => {
    const db = previewDb();
    const { q, categoryId } = getQuery<{ q?: string; categoryId?: string }>(event);

    let items = db.materials.slice();

    if (categoryId) items = items.filter((m) => m.categoryId === categoryId);
    if (q) items = items.filter((m) => m.name.toLowerCase().includes(String(q).toLowerCase()));

    return { results: items.map((m) => decorate(m, db)), count: items.length };
});
