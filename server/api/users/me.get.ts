import { getServerSession } from '#auth';
import { dbClient } from '~/lib/dbClient';

export default defineEventHandler(async (event) => {
	try {
		const session = await getServerSession(event);

		if (!session) throw new Error('Session not found');

		const userId = session?.user.id;

		return await dbClient.user.findUnique({
			where: { id: userId },
		});
	}
	catch (e) {
		console.warn('User me/ get: ', e);
		throw e;
	}
});
