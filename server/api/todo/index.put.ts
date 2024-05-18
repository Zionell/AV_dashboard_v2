import { dbClient } from '~/lib/dbClient';

export default defineEventHandler(async (event) => {
	try {
		const { id }: { id: string } = getQuery(event);
		const body = await readBody(event);

		await dbClient.todo.update({
			where: {
				id,
			},
			data: {
				...body,
			},
		});

		setResponseStatus(event, 204);
	}
	catch (e) {
		console.warn('Todo/ put: ', e);
		return e;
	}
});
