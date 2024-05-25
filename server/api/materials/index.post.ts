import { dbClient } from '~/lib/dbClient';

export default defineEventHandler(async (event) => {
	try {
		const body = await readBody(event);

		await dbClient.material.create({
			data: {
				name: body?.name ?? '',
				description: body?.description ?? '',
				sourceLink: body?.sourceLink ?? '',
				project: body?.projectId ? {
					connect: {
						id: body.projectId,
					}
				} : {},
				company: body?.companyId ?{
					connect: {
						id: body.companyId,
					}
				}: {},
				category: body?.categoryId ?{
					connect: {
						id: body.categoryId,
					}
				}: {}
			},
		});

		setResponseStatus(event, 201);
	}
	catch (e) {
		console.warn('Material/ post: ', e);
		return e;
	}
});
