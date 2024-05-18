import { dbClient } from '~/lib/dbClient';

export default defineEventHandler(async (event) => {
	try {
		const { curProjectId }: { curProjectId: string } = getQuery(event);

		const [allTodos, completed] = await Promise.all([
			dbClient.todo.count({
				where: {
					projectId: curProjectId,
				},
			}),
			dbClient.todo.count({
				where: {
					projectId: curProjectId,
					isCompleted: true,
				},
			}),
		]);

		return { allTodos, completed	};
	}
	catch (e) {
		console.warn('Todo progress/ get: ', e);
		throw e;
	}
});
