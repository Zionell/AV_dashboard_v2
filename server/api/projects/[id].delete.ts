import { dbClient } from '~~/lib/dbClient';

export default defineEventHandler(async (event) => {
    try {
        const id = getRouterParam(event, 'id');

        await dbClient.project.delete({
            where: { id },
        });

        setResponseStatus(event, 204);
    } catch (e) {
        console.warn('Projects/ delete: ', e);
        return e;
    }
});
