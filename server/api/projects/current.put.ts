import type { Project } from '@prisma/client';
import { dbClient } from '~/lib/dbClient';

export default defineEventHandler(async (event) => {
	try {
		const { id, userId }: { id: string; userId: string } = getQuery(event);

		await dbClient.user.update({
			where: {
				id: userId,
			},
			data: {
				projects: {
					updateMany: {
						where: {
							isCurrent: true,
						},
						data: {
							isCurrent: false,
						},
					},
				},
			},
		});
		await dbClient.user.update({
			where: {
				id: userId,
			},
			data: {
				projects: {
					updateMany: {
						where: {
							projectId: id,
						},
						data: {
							isCurrent: true,
						},
					},
				},
			},
		});

		setResponseStatus(event, 204);
	}
	catch (e) {
		console.warn('Projects current/ put: ', e);
		throw e;
	}
});
