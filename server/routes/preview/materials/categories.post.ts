import { previewDb, previewId, type PreviewCategory } from '~~/server/utils/preview/store';

// Копия POST /api/materials/categories
export default defineEventHandler(async (event) => {
    const db = previewDb();
    const body = await readBody(event);

    const category: PreviewCategory = {
        id: previewId('dcat'),
        label: body.label,
        color: body.color || 'blue',
        companyId: db.company.id,
    };

    db.categories.push(category);
    setResponseStatus(event, 201);

    return category;
});
