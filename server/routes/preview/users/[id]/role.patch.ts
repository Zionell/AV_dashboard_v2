import { previewDb } from '~~/server/utils/preview/store';

// Копия PATCH /api/users/[id]/role: смена роли участника в памяти демо.
export default defineEventHandler(async (event) => {
    const db = previewDb();
    const id = getRouterParam(event, 'id');
    const body = await readBody<{ role?: string }>(event);
    const target = db.users.find((u) => u.id === id);

    if (!target) throw createError({ statusCode: 404, message: 'Member not found' });
    if (!body.role) throw createError({ statusCode: 400, message: 'Role is required' });

    // Нельзя оставить компанию без владельца.
    if (target.role === 'OWNER' && body.role !== 'OWNER') {
        const owners = db.users.filter((u) => u.role === 'OWNER').length;

        if (owners <= 1) throw createError({ statusCode: 400, message: 'The company must have at least one owner' });
    }

    target.role = body.role;
    // Если правим самого демо-пользователя — синхронизируем его карточку.
    if (db.user.id === target.id) db.user.role = body.role;

    return { id: target.id, name: target.name, email: target.email, role: target.role };
});
