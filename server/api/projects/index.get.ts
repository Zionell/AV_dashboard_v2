import {dbClient} from '~/lib/dbClient';
import type {IProject} from '~/types/projects';

export default defineEventHandler(async (event): Promise<IProject[]> => {
	try {
		const {
			userId,
			take = '15',
			skip = '0',
		}: { userId: string; take: string; skip: string } = getQuery(event);

		const projects = await dbClient.project.findMany({
			take: Number(take),
			skip: Number(skip),
			where: {
				users: {
					some: {
						userId: userId
					},
				}
			},
			include: {
				todo: {
					select: {
						isCompleted: true,
					},
				},
				users: {
					include: {
						user: {
							select: {
								id: true,
								name: true,
								role: true,
							},
						},
					},
				},
			},
		});

		return projects || [];
	} catch (e) {
		console.warn('Projects all/ get: ', e);
		throw e;
	}
});
