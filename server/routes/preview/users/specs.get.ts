import { previewDb } from '~~/server/utils/preview/store';

// Копия GET /api/users/specs — люди компании для селекта исполнителя.
export default defineEventHandler(() => previewDb().users.map((u) => ({ id: u.id, name: u.name })));
