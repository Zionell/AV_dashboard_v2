import { dbClient } from '~/lib/dbClient';
import type { SortType } from '~/types';

type QueryType = {
	companyId: string;
	take: string;
	skip: string;
	order: SortType;
	q: string;
};

export default defineEventHandler(async (event) => {
	try {
		const { companyId, take = '100', skip = '0', order = 'desc', q }: QueryType = getQuery(event);

		const users = await dbClient.user.findMany({
			take: Number(take),
			skip: Number(skip),
			where: {
				companyId: companyId,
				name: {
					contains: q,
					mode: 'insensitive',
				},
			},
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
			},
			orderBy: {
				name: { sort: order, nulls: 'last' },
			},
		});
		const count = await dbClient.user.count({
			where: {
				companyId: companyId,
			},
		});

		return { users, count };
	}
	catch (e) {
		console.warn('User list/ get: ', e);
		throw e;
	}
});
