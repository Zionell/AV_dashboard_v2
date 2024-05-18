import { dbClient } from '~/lib/dbClient';

export default defineEventHandler(async (event) => {
	try {
		const { companyId, search }: { companyId: string; search: string } = getQuery(event);

		const users = await dbClient.user.findMany({
			take: 10,
			skip: 0,
			where: {
				companyId: companyId,
				name: {
					contains: search,
				},
			},
			select: {
				id: true,
				name: true,
				role: true,
			},
		});

		return users || [];
	}
	catch (e) {
		console.warn('User search/ get: ', e);
		throw e;
	}
});
