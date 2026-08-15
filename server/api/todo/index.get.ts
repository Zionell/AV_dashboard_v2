import { prisma } from '~~/server/utils/prisma';
import type { ITaskCard, TaskSortKey } from '#shared/types/todo';
import type { ETodoStatus } from '#shared/types/times';

interface IQuery {
    q?: string;
    projectId?: string;
    executorId?: string;
    authorId?: string;
    priority?: string;
    sort?: TaskSortKey;
    take?: string;
    skip?: string;
}

export default defineEventHandler(async (event): Promise<{ results: ITaskCard[]; count: number }> => {
    try {
        const query: IQuery = getQuery(event);
        const take = Math.min(Number(query.take) || 20, 200);
        const skip = Number(query.skip) || 0;

        const where = {
            // projectScope: owner — вся компания, manager/employee — только свои проекты.
            project: projectScope(event),
            ...(query.q ? { name: { contains: query.q, mode: 'insensitive' as const } } : {}),
            ...(query.projectId ? { projectId: query.projectId } : {}),
            ...(query.executorId ? { executorId: query.executorId } : {}),
            ...(query.authorId ? { authorId: query.authorId } : {}),
            // priority приходит строкой из query — в БД это Int.
            ...(query.priority ? { priority: Number(query.priority) } : {}),
        };

        const orderBy = (() => {
            switch (query.sort) {
                case 'oldest':
                    return { createdAt: 'asc' as const };
                case 'due':
                    return { dueDate: 'asc' as const };
                case 'priority':
                    // Чем больше число, тем выше приоритет; null'ы при desc уходят вниз.
                    // Второй ключ обязателен: без него порядок среди равных приоритетов
                    // не определён и записи могут прыгать между страницами.
                    return [{ priority: 'desc' as const }, { createdAt: 'desc' as const }];
                default:
                    return { createdAt: 'desc' as const };
            }
        })();

        const include = {
            executor: { select: { id: true, name: true, image: true } },
            author: { select: { id: true, name: true, image: true } },
            project: { select: { id: true, name: true } },
        };

        const count = await prisma.todo.count({ where });
        const items = await prisma.todo.findMany({ where, include, orderBy, take, skip });

        const ids = items.map((t) => t.id);

        // Залогированное время по задачам страницы.
        const now = Date.now();
        const [sessions, commentGroups, attachmentGroups] = await Promise.all([
            prisma.times.findMany({
                where: { todoId: { in: ids } },
                select: { todoId: true, active: true, createdAt: true, updatedAt: true },
            }),
            prisma.todoComment.groupBy({ by: ['todoId'], where: { todoId: { in: ids } }, _count: { _all: true } }),
            prisma.todoAttachment.groupBy({ by: ['todoId'], where: { todoId: { in: ids } }, _count: { _all: true } }),
        ]);
        const loggedByTodo: Record<string, number> = {};

        for (const s of sessions) {
            if (!s.todoId) continue;

            const ms = Math.max(0, (s.active ? now : s.updatedAt.getTime()) - s.createdAt.getTime());

            loggedByTodo[s.todoId] = (loggedByTodo[s.todoId] || 0) + ms;
        }

        const commentsByTodo = Object.fromEntries(commentGroups.map((g) => [g.todoId, g._count._all]));
        const attachmentsByTodo = Object.fromEntries(attachmentGroups.map((g) => [g.todoId, g._count._all]));

        const results: ITaskCard[] = items.map((t) => ({
            ...t,
            status: t.status as ETodoStatus,
            loggedMs: loggedByTodo[t.id] || 0,
            commentsCount: commentsByTodo[t.id] || 0,
            attachmentsCount: attachmentsByTodo[t.id] || 0,
        }));

        return { results, count };
    } catch (e) {
        logger.warn('Todo/ get: ', e);
        throw e;
    }
});
