import { dbClient } from '~~/lib/dbClient';

export default defineEventHandler(async (event) => {
    try {
        const body: { userId: string } = await readBody(event);

        return dbClient.times.create({
            data: {
                active: true,
                user: {
                    connect: {
                        id: body?.userId ?? '',
                    },
                },
            },
        });
    } catch (e) {
        return e;
    }
});
