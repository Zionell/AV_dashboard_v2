import { dbClient } from '~/lib/dbClient';

export default defineEventHandler(async (event) => {
	try {
		const { id }: { id: string } = getQuery(event);

		await dbClient.material.delete({
			where: { id },
		});

		setResponseStatus(event, 204);
	}
	catch (e) {
		console.warn('Material/ delete: ', e);
		throw e;
	}
});
