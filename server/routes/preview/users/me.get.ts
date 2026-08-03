import { previewDb } from '~~/server/utils/preview/store';

// Демо-профиль. Без БД и без сессии — /preview/** не проходит через auth-мидлвару (та только на /api/).
export default defineEventHandler(() => previewDb().user);
