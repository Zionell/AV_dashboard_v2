import { dbClient } from '~/lib/dbClient';

export default defineEventHandler(async (event) => {
	try {
		const body = await readBody(event);
		const {name, description, sourceLink, companyId, projectId, categoryId} = body;

		await dbClient.material.create({
			data: {
				name: name ?? '',
				description: description ?? '',
				sourceLink: sourceLink ?? '',
				project: projectId ? {
					connect: {
						id: projectId,
					}
				} : {},
				company: {
					connect: {
						id: companyId,
					}
				},
				category: {
					connect: {
						id: categoryId,
					}
				}
			},
		});

		setResponseStatus(event, 201);
	}
	catch (e) {
		console.warn('Material/ post: ', e);
		return e;
	}
});
