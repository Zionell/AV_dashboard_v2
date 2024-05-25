import {dbClient} from '~/lib/dbClient';

export default defineEventHandler(async (event) => {
	try {
		const body = await readBody(event);
		const {times, date, month, userId} = body;

		await dbClient.times.create({
			data: {
				times: times ?? 0,
				date: date ?? '',
				month: month ?? 0,
				user: {
					connect: {
						id: userId,
					}
				},
			},
		});

		setResponseStatus(event, 201);
	} catch (e) {
		return e;
	}
});
