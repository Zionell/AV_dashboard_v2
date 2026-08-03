import { previewDb } from '~~/server/utils/preview/store';

// Копия GET /api/times/active: активные сессии демо-юзера (в памяти).
export default defineEventHandler(() => previewDb().times.filter((s) => s.active));
