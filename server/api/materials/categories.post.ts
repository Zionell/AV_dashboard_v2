import { dbClient } from '~/lib/dbClient';

export default defineEventHandler(async (event) => {
	try {
		const body = await readBody(event);

		return await dbClient.materialCategory.create({
			data: body,
		});
	}
	catch (e) {
		console.warn('MaterialCategory/ post: ', e);
		throw e;
	}
});
