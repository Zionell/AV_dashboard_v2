import { dbClient } from '~~/lib/dbClient';
import { EUserRole } from '#shared/types/user';

export default defineEventHandler(async (event) => {
    try {
        requireRole(event, EUserRole.OWNER);
        const companyId = requireCompanyId(event);
        const id = getRouterParam(event, 'id');

        const { count } = await dbClient.project.deleteMany({
            where: { id, companyId },
        });

        if (!count) throw createError({ statusCode: 404, message: 'Project not found' });

        setResponseStatus(event, 204);
    } catch (e) {
        logger.warn('Projects/ delete: ', e);
        throw e;
    }
});
