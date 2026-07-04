import { dbClient } from '~~/lib/dbClient';
import type { IUserSpec } from '#shared/types/user';

export default defineEventHandler(async (event): Promise<IUserSpec[]> => {
    try {
        const { id }: { id: string } = getQuery(event);

        const items = await dbClient.user.findMany({
            take: 14,
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
