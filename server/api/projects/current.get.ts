import type { Project } from '@prisma/client';
import { dbClient } from '~/lib/dbClient';

export default defineEventHandler(async (event): Promise<Project | null> => {
	try {
		const { id }: { id: string } = getQuery(event);

		const project = await dbClient.project.findMany({
			where: {
				users: {
					some: {
						userId: id,
						isCurrent: true,
					},
				},
			},
		});

		return project[0] || null;
	}
	catch (e) {
		console.warn('Projects current/ get: ', e);
		throw e;
	}
});
