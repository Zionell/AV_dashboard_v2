import { dbClient } from '~/lib/dbClient';

export default defineEventHandler(async (event) => {
	try {
		const { companyId, take = '100', skip = '0' }: { companyId: string; take: string; skip: string } = getQuery(event);

		const material = await dbClient.material.findMany({
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

		return { material, count };
	}
	catch (e) {
		console.warn('Material/ get: ', e);
		throw e;
	}
});
