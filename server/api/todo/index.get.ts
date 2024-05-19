import { dbClient } from '~/lib/dbClient';

export default defineEventHandler(async (event) => {
	try {
		const { userId, take = '100', skip = '0' }: { userId: string; take: string; skip: string } = getQuery(event);

		const curProjectId = await dbClient.usersOnProjects.findFirst({
			where: {
				userId: userId,
				isCurrent: true,
			},
			select: {
				projectId: true,
			},
		});

		if (!curProjectId) {
			throw new Error('Todo for current project is not found');
		}

		const items = await dbClient.todo.findMany({
			take: Number(take),
			skip: Number(skip),
			where: {
				projectId: curProjectId.projectId,
			},
			include: {
				executor: {
					select: {
						name: true,
						role: true,
					},
				},
				todoStatus: true,
			},
		});

		return items || [];
	}
	catch (e) {
		console.warn('Todo/ get: ', e);
		return []
	}
});
