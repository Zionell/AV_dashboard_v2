import { prisma } from '~~/server/utils/prisma';
import { isAuthPath, isMutatingMethod } from '#shared/utils/http';
import { READONLY_HINT } from '#shared/constants';

export default defineEventHandler(async (event) => {
    const path = event.path;

    if (!path.startsWith('/api/')) return;
    if (isAuthPath(path)) return;

    const { user: sessionUser } = await requireUserSession(event);

    const user = await prisma.user.findUnique({
        where: { id: sessionUser.id },
        select: { id: true, email: true, role: true, companyId: true },
    });

    if (!user) {
        await clearUserSession(event);
        throw createError({ statusCode: 401, message: 'Unauthorized' });
    }

    // Единственная точка, через которую проходит каждый /api/**-запрос, поэтому запрет
    // на запись стоит здесь, а не в отдельных обработчиках: новый эндпоинт закрыт
    // по умолчанию, и забыть про него нельзя.
    if (isReadonlyRole(user.role) && isMutatingMethod(event.method)) {
        throw createError({ statusCode: 403, message: READONLY_HINT });
    }

    // Читает TEST как владелец — подробности в effectiveRole().
    event.context.user = { ...user, role: effectiveRole(user.role) };
});
