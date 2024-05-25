import {dbClient} from '~/lib/dbClient';

export default defineEventHandler(async (event) => {
	try {
		const body = await readBody(event);

		await dbClient.times.create({
			data: {
				times: body?.times ?? 0,
				date: body?.date ?? '',
				month: body?.month ?? 0,
				user: {
					connect: {
						id: body?.userId ?? '',
					}
				},
			},
		});

		setResponseStatus(event, 201);
	} catch (e) {
		return e;
	}
});
