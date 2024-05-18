import { dbClient } from '~/lib/dbClient';

export default defineEventHandler(async (event) => {
	try {
		const body = await readBody(event);
		const { name, userId } = body;

		const company = await dbClient.company.create({
			data: { name },
		});
		await dbClient.user.update({
			where: {
				id: userId,
			},
			data: {
				role: "OWNER",
				companyId: company.id,
			},
		});
		setResponseStatus(event, 201);
	}
	catch (e) {
		console.warn('Company/ post: ', e);
		return e;
	}
});
