import { prisma } from '~~/server/utils/prisma';

export default defineEventHandler(async (event) => {
    try {
        const { take = '15', skip = '0' }: { take: string; skip: string } = getQuery(event);

        const where = projectScope(event);

        const projects = await prisma.project.findMany({
            take: Number(take),
            skip: Number(skip),
            where,
            include: {
                todo: {
                    select: {
                        isCompleted: true,
                    },
                },
            },
        });
        const count = await prisma.project.count({ where });

        return { results: projects, count };
    } catch (e) {
        logger.warn('Projects all/ get: ', e);
        throw e;
    }
});
