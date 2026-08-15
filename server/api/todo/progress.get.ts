import { prisma } from '~~/server/utils/prisma';

export default defineEventHandler(async (event) => {
    try {
        const { curProjectId }: { curProjectId: string } = getQuery(event);
        const projectId = await requireProjectMembership(event, curProjectId);

        const [allTodos, completed] = await Promise.all([
            prisma.todo.count({
                where: {
                    projectId,
                },
            }),
            prisma.todo.count({
                where: {
                    projectId,
                    isCompleted: true,
                },
            }),
        ]);

        return { allTodos, completed };
    } catch (e) {
        logger.warn('Todo progress/ get: ', e);
        throw e;
    }
});
