import { dbClient } from '~~/lib/dbClient';

export default defineEventHandler(async (event): Promise<any[]> => {
    try {
        const { id }: { id: string } = getQuery(event);

        const items = await dbClient.project.findMany({
            take: 10,
            where: {
                companyId: id,
            },
            select: {
                id: true,
                name: true,
            },
        });

        return items || [];
    } catch (e) {
        console.warn('Projects specs/ get: ', e);
        throw e;
    }
});
