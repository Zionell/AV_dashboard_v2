import { dbClient } from '~~/lib/dbClient';

export default defineEventHandler(async (event) => {
    try {
        const id = getRouterParam(event, 'id');
        const body = await readBody(event);

        await dbClient.times.update({
            where: { id },
            data: {
                user: {
                    connect: {
                        id: body?.userId ?? '',
                    },
                },
                active: false,
            },
        });

        setResponseStatus(event, 200);
    } catch (e) {
        return e;
    }
});
