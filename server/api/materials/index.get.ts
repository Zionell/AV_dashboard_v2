import { dbClient } from '~~/lib/dbClient';

export default defineEventHandler(async (event) => {
    try {
        const {
            companyId,
            take = '24',
            skip = '0',
        }: { companyId: string; take: string; skip: string } = getQuery(event);

        if (!companyId) {
            throw new Error('Company id is not found');
        }

        const materials = await dbClient.material.findMany({
            take: Number(take),
            skip: Number(skip),
            where: {
                companyId: companyId,
            },
            include: {
                category: true,
            },
        });
        const count = await dbClient.material.count({
            where: {
                companyId: companyId,
                projectId: null,
            },
        });

        return { results: materials, count };
    } catch (e) {
        console.warn('Material/ get: ', e);
        return {};
    }
});
