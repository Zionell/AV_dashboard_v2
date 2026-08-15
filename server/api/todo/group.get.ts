import { prisma } from '~~/server/utils/prisma';

export default defineEventHandler(async (event) => {
    try {
        const { curProjectId }: { curProjectId: string } = getQuery(event);
        const projectId = await requireProjectMembership(event, curProjectId);

        const items = await prisma.todo.groupBy({
            by: ['status'],
            where: {
                projectId,
            },
            _count: {
                status: true,
            },
        });

        return items || [];
    } catch (e) {
        logger.warn('Todo group/ get: ', e);
        throw e;
    }
});
