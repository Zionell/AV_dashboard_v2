import { dbClient } from '~/lib/dbClient';
import type { TimeType } from '~/types';

export default defineEventHandler(async (event): Promise<TimeType[]> => {
	try {
		const { userId, month }: { userId: string; month: string } = getQuery(event);

		const items = await dbClient.times.groupBy({
			by: ['date'],
			where: {
				month: Number(month),
				userId,
			},
			orderBy: {
				date: 'asc',
			},
			_sum: {
				times: true,
			},
		});

		return items || [];
	}
	catch (e) {
		console.warn('Times all/ get: ', e);
		throw e;
	}
});
