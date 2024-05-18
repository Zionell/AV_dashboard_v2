import { dbClient } from '~/lib/dbClient';

export default defineEventHandler(async (event) => {
	try {
		const { id }: { id: string } = getQuery(event);

		await dbClient.todo.delete({
			where: { id },
		});

		setResponseStatus(event, 204);
	}
	catch (e) {
		console.warn('Todo/ delete: ', e);
		throw e;
	}
});
