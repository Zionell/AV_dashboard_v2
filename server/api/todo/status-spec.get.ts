import { dbClient } from '~/lib/dbClient';

export default defineEventHandler(async () => {
	try {
		const items = await dbClient.todoStatus.findMany();

		return items || [];
	}
	catch (e) {
		console.warn('TodoStatus spec/ get: ', e);
		throw e;
	}
});
