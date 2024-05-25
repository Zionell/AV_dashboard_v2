import {dbClient} from '~/lib/dbClient';

export default defineEventHandler(async (event) => {
	try {
		const body = await readBody(event);

		const {name, description, isCompleted, executorId, projectId, todoStatusId} = body;

		await dbClient.todo.create({
			data: {
				name: name ?? '',
				description: description ?? '',
				isCompleted: isCompleted ?? false,
				project: {
					connect: {
						id: projectId,
					}
				},
				executor: {
					connect: {
						id: executorId,
					}
				},
				todoStatus: {
					connect: {
						id: todoStatusId,
					}
				}
			},
		});

		setResponseStatus(event, 201);
	} catch (e) {
		console.warn('Todo/ post: ', e);
		return e;
	}
});
