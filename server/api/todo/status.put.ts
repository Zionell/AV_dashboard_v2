import { dbClient } from '~/lib/dbClient';

export default defineEventHandler(async (event) => {
	try {
		const { id, statusId }: { id: string; statusId: string } = getQuery(event);

		await dbClient.todo.update({
			where: {
				id,
			},
			data: {
				todoStatusId: statusId,
			},
		});

		setResponseStatus(event, 204);
	}
	catch (e) {
		console.warn('Todo status/ put: ', e);
		return e;
	}
});
