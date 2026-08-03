import { previewDb } from '~~/server/utils/preview/store';

// Копия GET /api/company
export default defineEventHandler(() => previewDb().company);
