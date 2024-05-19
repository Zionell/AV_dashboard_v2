import { getServerSession } from '#auth';
import { dbClient } from '~/lib/dbClient';

export default defineEventHandler(async (event) => {
	try {
		const cookies = parseCookies(event)
		const sessionToken = cookies['next-auth.session-token'] || cookies['__Secure-next-auth.session-token'];

		if (!sessionToken) {
			throw createError({
				statusCode: 403,
				statusMessage: 'Session not found',
			})
		}

		const session = await getServerSession(event);
		if (!session) {
			throw createError({
				statusCode: 403,
				statusMessage: 'Unauthorized',
			})
		}

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
