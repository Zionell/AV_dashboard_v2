import { dbClient } from '~~/lib/dbClient';

export default defineEventHandler(async (event) => {
    try {
        const { id }: { id: string } = getQuery(event);

        const company = await dbClient.company.findUnique({
            where: { id },
            include: {
                users: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        role: true,
                    },
                },
            },
        });

        return company || null;
    } catch (e) {
        console.warn('Company/ get: ', e);
        throw e;
    }
});
