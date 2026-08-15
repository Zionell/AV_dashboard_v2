import { prisma } from '~~/server/utils/prisma';
import { ETodoStatus } from '#shared/types/times';

export default defineEventHandler(async (event) => {
    try {
        const items = await prisma.todo.findMany({
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
