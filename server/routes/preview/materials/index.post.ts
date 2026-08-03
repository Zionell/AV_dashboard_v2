import { previewDb, previewId, type PreviewMaterial } from '~~/server/utils/preview/store';

// Копия POST /api/materials: создаём материал в памяти.
export default defineEventHandler(async (event) => {
    const db = previewDb();
    const body = await readBody(event);

    const material: PreviewMaterial = {
        id: previewId('dm'),
        name: body.name,
        sourceLink: body.sourceLink || '',
        categoryId: body.categoryId,
        projectId: body.projectId ?? null,
        companyId: db.company.id,
        authorId: db.user.id,
    };

    db.materials.unshift(material);
    setResponseStatus(event, 201);

    return material;
});
