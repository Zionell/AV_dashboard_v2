import { dbClient } from '~~/lib/dbClient';
import { ETodoStatus } from '#shared/types/times';
import { EProjectEventType } from '#shared/types/projects';

const STATUSES: string[] = [ETodoStatus.TODO, ETodoStatus.IN_PROGRESS, ETodoStatus.REVIEW, ETodoStatus.DONE];

export default defineEventHandler(async (event) => {
    try {
        const user = requireApiUser(event);
        const { id, status }: { id: string; status: string } = getQuery(event);

        if (!status || !STATUSES.includes(status)) {
            throw createError({ statusCode: 400, message: 'Invalid status' });
        }

        // Смена статуса доступна всем ролям в рамках их проектов (owner — вся компания).
        const existing = await dbClient.todo.findFirst({
            where: {
                id,
                project: projectScope(event),
            },
            select: { id: true, projectId: true, name: true, status: true },
        });

        if (!existing) throw createError({ statusCode: 404, message: 'Task not found' });

        await dbClient.todo.update({
            where: { id: existing.id },
            data: {
                status,
                isCompleted: status === ETodoStatus.DONE,
            },
        });

        if (status !== existing.status) {
            recordEvent(event, {
                type: EProjectEventType.TASK_STATUS_CHANGED,
                projectId: existing.projectId,
                actorId: user.id,
                targetName: existing.name,
                meta: { from: existing.status, to: status },
            });
        }

        setResponseStatus(event, 204);
    } catch (e) {
        logger.warn('Todo status/ put: ', e);
        throw e;
    }
});
