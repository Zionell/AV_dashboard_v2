import { previewDb } from '~~/server/utils/preview/store';

// Копия GET /api/materials/categories
export default defineEventHandler((event) => {
    const db = previewDb();
    const { search } = getQuery<{ search?: string }>(event);

    return search
        ? db.categories.filter((c) => c.label.toLowerCase().includes(String(search).toLowerCase()))
        : db.categories;
});
