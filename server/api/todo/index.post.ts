import { dbClient } from '~/lib/dbClient';

export default defineEventHandler(async (event) => {
	try {
		const body = await readBody(event);

		await dbClient.todo.create({
			data: body,
		});

		setResponseStatus(event, 201);
	}
	catch (e) {
		console.warn('Todo/ post: ', e);
		return e;
	}
});
