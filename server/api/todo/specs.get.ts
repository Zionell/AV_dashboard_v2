import { dbClient } from '~/lib/dbClient';

export default defineEventHandler(async (event) => {
	try {
		const { curProjectId }: { curProjectId: string } = getQuery(event);

		const items = await dbClient.todo.findMany({
			where: {
				projectId: curProjectId,
			},
			select: {
				id: true,
				name: true,
				todoStatus: true,
			},
		});

		return items || [];
	}
	catch (e) {
		console.warn('Todo spec/ get: ', e);
		throw e;
	}
});
