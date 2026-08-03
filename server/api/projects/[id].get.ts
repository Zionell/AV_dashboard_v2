import { startOfDay, startOfWeek } from 'date-fns';
import { dbClient } from '~~/lib/dbClient';
import { ETodoStatus } from '#shared/types/times';
import type { IProjectDetail, IProjectMemberStat, IProjectEvent, EProjectEventType } from '#shared/types/projects';
import type { EUserRole } from '#shared/types/user';

export default defineEventHandler(async (event): Promise<IProjectDetail> => {
    try {
        const id = getRouterParam(event, 'id');

        const projectId = await requireProjectMembership(event, id);

        const project = await dbClient.project.findFirst({
            where: { id: projectId },
            include: {
                todo: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                        isCompleted: true,
                        executorId: true,
                        updatedAt: true,
                    },
                },
                users: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, image: true, role: true },
                        },
                    },
                },
                materials: {
                    take: 5,
                    orderBy: { updatedAt: 'desc' },
                    select: {
                        id: true,
                        name: true,
                        category: { select: { label: true, color: true } },
                    },
                },
            },
        });

        if (!project) throw createError({ statusCode: 404, message: 'Project not found' });

        const now = new Date();
        const dayStart = startOfDay(now);
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });

        const sessions = await dbClient.times.findMany({
            where: { todo: { projectId } },
            select: { userId: true, active: true, createdAt: true, updatedAt: true },
        });

        const durationOf = (s: (typeof sessions)[number]) =>
            Math.max(0, (s.active ? now : s.updatedAt).getTime() - s.createdAt.getTime());

        let totalTimeMs = 0;
        const timeByUser: Record<string, { todayMs: number; weekMs: number }> = {};

        for (const s of sessions) {
            const ms = durationOf(s);

            totalTimeMs += ms;

            const bucket = (timeByUser[s.userId] ||= { todayMs: 0, weekMs: 0 });

            if (s.createdAt >= dayStart) bucket.todayMs += ms;
            if (s.createdAt >= weekStart) bucket.weekMs += ms;
        }

        const byStatus: Record<ETodoStatus, number> = {
            [ETodoStatus.TODO]: 0,
            [ETodoStatus.IN_PROGRESS]: 0,
            [ETodoStatus.REVIEW]: 0,
            [ETodoStatus.DONE]: 0,
        };
        const tasksByExecutor: Record<string, number> = {};

        for (const t of project.todo) {
            byStatus[(t.status as ETodoStatus) || ETodoStatus.TODO] ??= 0;
            byStatus[(t.status as ETodoStatus) || ETodoStatus.TODO]++;
            tasksByExecutor[t.executorId] = (tasksByExecutor[t.executorId] || 0) + 1;
        }

        const completedTasks = project.todo.filter((t) => t.isCompleted).length;

        const members: IProjectMemberStat[] = project.users.map(({ user }) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role as EUserRole,
            todayMs: timeByUser[user.id]?.todayMs || 0,
            weekMs: timeByUser[user.id]?.weekMs || 0,
            tasksCount: tasksByExecutor[user.id] || 0,
        }));

        const recentTasks = [...project.todo]
            .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
            .slice(0, 5)
            .map((t) => ({
                id: t.id,
                name: t.name,
                status: (t.status as ETodoStatus) || ETodoStatus.TODO,
                updatedAt: t.updatedAt.toISOString(),
            }));

        const eventRows = await dbClient.event.findMany({
            where: { projectId },
            include: { actor: { select: { id: true, name: true, image: true } } },
            orderBy: { createdAt: 'desc' },
            take: 8,
        });

        const events: IProjectEvent[] = eventRows.map((e) => ({
            id: e.id,
            type: e.type as EProjectEventType,
            actor: e.actor,
            targetName: e.targetName,
            meta: (e.meta as Record<string, string> | null) ?? null,
            createdAt: e.createdAt,
        }));

        const { todo, users, materials, ...meta } = project;

        return {
            ...meta,
            isClosed: todo.length > 0 && completedTasks === todo.length,
            stats: {
                totalTasks: todo.length,
                completedTasks,
                membersCount: users.length,
                totalTimeMs,
                byStatus,
            },
            members,
            recentTasks,
            materials,
            events,
        };
    } catch (e) {
        logger.warn('Project detail / get: ', e);
        throw e;
    }
});
