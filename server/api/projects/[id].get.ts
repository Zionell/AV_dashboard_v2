import { dbClient } from '~~/lib/dbClient';

export default defineEventHandler(async (event) => {
    try {
        const id = getRouterParam(event, 'id');

        return await dbClient.project.findFirst({
            where: { id },
            include: {
                todo: {
                    select: {
                        isCompleted: true,
                    },
                },
                users: {
                    include: {
                        user: true,
                    },
                },
            },
        });
    } catch (e) {
        console.warn('Project detail / get: ', e);
        throw e;
    }
});
