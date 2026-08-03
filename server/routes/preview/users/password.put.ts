import { previewDb } from '~~/server/utils/preview/store';

// Копия PUT /api/users/password: в демо просто помечаем, что пароль задан.
// Без БД и хеширования — храним только флаг в памяти.
export default defineEventHandler(() => {
    previewDb().user.hasPassword = true;

    return true;
});
