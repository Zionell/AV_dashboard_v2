import { previewDb } from '~~/server/utils/preview/store';

// Копия PATCH /api/materials/[id]: правка материала в памяти.
export default defineEventHandler(async (event) => {
    const db = previewDb();
    const id = getRouterParam(event, 'id');
    const body = await readBody(event);
    const material = db.materials.find((m) => m.id === id);

    if (!material) throw createError({ statusCode: 404, message: 'Material not found' });

    for (const key of ['name', 'sourceLink', 'categoryId', 'projectId'] as const) {
        if (body[key] !== undefined) (material as unknown as Record<string, unknown>)[key] = body[key];
    }

    return material;
});
