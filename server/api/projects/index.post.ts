import { dbClient } from '~~/lib/dbClient';

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);

        const { companyId, users, ...rest } = body;
        const usersArr = users ? users : [];

        await dbClient.project.create({
            data: {
                ...rest,
                company: {
                    connect: {
                        id: companyId,
                    },
                },
                users: {
                    create: [
                        ...usersArr.map((userId: string) => ({
                            user: {
                                connect: {
                                    id: userId,
                                },
                            },
                        })),
                    ],
                },
            },
        });

        setResponseStatus(event, 201);
    } catch (e) {
        console.warn('Projects/ post: ', e);
        return e;
    }
});
