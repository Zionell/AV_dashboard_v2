import { dbClient } from '~/lib/dbClient';

export default defineEventHandler(async (event) => {
	try {
		const { search }: { search: string } = getQuery(event);

		const categories = await dbClient.materialCategory.findMany({
			where: {
				label: {
					contains: search,
				},
			},
		});

		return categories || [];
	}
	catch (e) {
		console.warn('MaterialCategory/ get: ', e);
		throw e;
	}
});
