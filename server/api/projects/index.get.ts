import { dbClient } from '~~/lib/dbClient';

export default defineEventHandler(async (event) => {
    try {
        const { userId, take = '15', skip = '0' }: { userId: string; take: string; skip: string } = getQuery(event);

        const projects = await dbClient.project.findMany({
            take: Number(take),
            skip: Number(skip),
            where: {
                users: {
                    some: {
                        userId: userId,
                    },
                },
            },
            include: {
                todo: {
                    select: {
                        isCompleted: true,
                    },
                },
            },
        });
        const count = await dbClient.project.count({
            where: {
                users: {
                    some: {
                        userId: userId,
                    },
                },
            },
        });

        return { results: projects, count };
    } catch (e) {
        console.warn('Projects all/ get: ', e);
        throw e;
    }
});
