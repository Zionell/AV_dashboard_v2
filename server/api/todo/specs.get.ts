import { dbClient } from '~~/lib/dbClient';
import { ETodoStatus } from '#shared/types/times';

export default defineEventHandler(async (event) => {
    try {
        const items = await dbClient.todo.findMany({
            where: {
                project: projectScope(event),
                status: ETodoStatus.IN_PROGRESS,
            },
            select: {
                id: true,
                name: true,
                status: true,
                projectId: true,
            },
        });

        return items || [];
    } catch (e) {
        logger.warn('Todo spec/ get: ', e);
        throw e;
    }
});
