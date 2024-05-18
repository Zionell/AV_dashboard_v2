import { dbClient } from '~/lib/dbClient';

export default defineEventHandler(async (event) => {
	try {
		const { id }: { id: string } = getQuery(event);

		await dbClient.project.update({
			where: { id },
			data: {
				users: {
					deleteMany: {},
				},
			},
		});
		await dbClient.project.delete({
			where: { id },
		});

		setResponseStatus(event, 204);
	}
	catch (e) {
		console.warn('Projects/ post: ', e);
		return e;
	}
});
