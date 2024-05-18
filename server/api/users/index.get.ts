import { dbClient } from '~/lib/dbClient';

export default defineEventHandler(async (event) => {
	try {
		const { companyId, take = '100', skip = '0' }: { companyId: string; take: string; skip: string } = getQuery(event);

		const users = await dbClient.user.findMany({
			take: Number(take),
			skip: Number(skip),
			where: {
				companyId: companyId,
			},
			select: {
				id: true,
				name: true,
				image: true,
				role: true,
			},
		});

		return users || [];
	}
	catch (e) {
		console.warn('User all/ get: ', e);
		throw e;
	}
});
