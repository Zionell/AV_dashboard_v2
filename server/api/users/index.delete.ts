import { dbClient } from '~/lib/dbClient';

export default defineEventHandler(async (event) => {
	try {
		const { item }: { item: string } = getQuery(event);

		await dbClient.user.delete({
			where: {
				email: item,
			},
		});

		setResponseStatus(event, 204);
	}
	catch (e) {
		console.warn('User/ delete: ', e);
		throw e;
	}
});
