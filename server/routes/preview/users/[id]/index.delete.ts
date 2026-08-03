import { previewDb } from '~~/server/utils/preview/store';

// Копия DELETE /api/users/[id]: удаление участника из памяти демо.
export default defineEventHandler((event) => {
    const db = previewDb();
    const id = getRouterParam(event, 'id');

    if (id === db.user.id) {
        throw createError({ statusCode: 400, message: 'To delete your own account, use profile settings' });
    }

    const idx = db.users.findIndex((u) => u.id === id);

    if (idx === -1) throw createError({ statusCode: 404, message: 'Member not found' });

    // Задачи удалённого переназначаем на демо-владельца — как в реальном эндпоинте.
    for (const t of db.todos) {
        if (t.executorId === id) t.executorId = db.user.id;
    }
    db.users.splice(idx, 1);

    setResponseStatus(event, 204);
});
