import { previewDb } from '~~/server/utils/preview/store';

// Копия DELETE /api/materials/[id]
export default defineEventHandler((event) => {
    const db = previewDb();
    const id = getRouterParam(event, 'id');

    db.materials = db.materials.filter((m) => m.id !== id);
    setResponseStatus(event, 204);

    return null;
});
