import { dbClient } from '~~/lib/dbClient';
import { EUserRole } from '#shared/types/user';

export default defineEventHandler(async (event) => {
    try {
        const user = requireRole(event, EUserRole.OWNER, EUserRole.MANAGER);
        const companyId = requireCompanyId(event);
        const { id }: { id: string } = getQuery(event);

        // OWNER — любой материал компании; MANAGER — общие + своих проектов.
        // На Mongo `projectId: null` не матчит отсутствующее поле — нужен ещё isSet: false.
        const where = hasRole(user, EUserRole.OWNER)
            ? { id, companyId }
            : {
                  id,
                  companyId,
                  OR: [
                      { projectId: null },
                      { projectId: { isSet: false } },
                      {
                          project: {
                              users: {
                                  some: {
                                      userId: user.id,
                                  },
                              },
                          },
                      },
                  ],
              };

        const { count } = await dbClient.material.deleteMany({ where });

        if (!count) throw createError({ statusCode: 404, message: 'Material not found' });

        setResponseStatus(event, 204);
    } catch (e) {
        logger.warn('Material/ delete: ', e);
        throw e;
    }
});
