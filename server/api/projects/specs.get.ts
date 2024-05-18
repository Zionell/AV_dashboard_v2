import { dbClient } from '~/lib/dbClient';
import type { ProjectSpec } from '~/types/projects';

export default defineEventHandler(async (event): Promise<ProjectSpec[]> => {
	try {
		const { id }: { id: string } = getQuery(event);

		const items = await dbClient.project.findMany({
			take: 10,
			where: {
				companyId: id,
			},
			select: {
				id: true,
				name: true,
			},
		});

		return items || [];
	}
	catch (e) {
		console.warn('Projects specs/ get: ', e);
		throw e;
	}
});
