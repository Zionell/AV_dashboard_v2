import { dbClient } from '~/lib/dbClient';

export default defineEventHandler(async (event) => {
	try {
		const { curProjectId }: { curProjectId: string } = getQuery(event);

		const items = await dbClient.todo.groupBy({
			by: ['todoStatusId'],
			where: {
				projectId: curProjectId,
			},
			_count: {
				todoStatusId: true,
			},
		});

		return items || [];
	}
	catch (e) {
		console.warn('Todo group/ get: ', e);
		throw e;
	}
});
