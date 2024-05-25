import {dbClient} from '~/lib/dbClient';

export default defineEventHandler(async (event) => {
	try {
		const body = await readBody(event);

		await dbClient.todo.create({
			data: {
				name: body?.name ?? '',
				description: body?.description ?? '',
				isCompleted: body?.isCompleted ?? false,
				project: body?.projectId ? {
					connect: {
						id: body.projectId,
					}
				} : {},
				executor: body?.executorId ? {
					connect: {
						id: body.executorId,
					}
				} : {},
				todoStatus: body?.todoStatusId ? {
					connect: {
						id: body.todoStatusId,
					}
				} : {}
			},
		});

		setResponseStatus(event, 201);
	} catch (e) {
		console.warn('Todo/ post: ', e);
		return e;
	}
});
