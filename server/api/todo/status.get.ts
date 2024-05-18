import { dbClient } from '~/lib/dbClient';

export default defineEventHandler(async (event) => {
	try {
		const { search }: { search: string } = getQuery(event);

		const items = await dbClient.todoStatus.findMany({
			where: {
				label: {
					contains: search,
				},
			},
		});

		return items || [];
	}
	catch (e) {
		console.warn('TodoStatus/ get: ', e);
		throw e;
	}
});
