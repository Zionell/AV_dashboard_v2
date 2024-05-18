import { dbClient } from '~/lib/dbClient';
import type { UserSpecType } from '~/types/user';

export default defineEventHandler(async (event): Promise<UserSpecType[]> => {
	try {
		const { id }: { id: string } = getQuery(event);

		const items = await dbClient.user.findMany({
			take: 10,
			where: {
				companyId: id,
			},
			select: {
				id: true,
				name: true,
			},
		});

		return items || [];
	}
	catch (e) {
		console.warn('Projects specs/ get: ', e);
		throw e;
	}
});
