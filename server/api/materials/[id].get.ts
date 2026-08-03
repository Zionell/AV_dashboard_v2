import { dbClient } from '~~/lib/dbClient';
import { EUserRole } from '#shared/types/user';

export default defineEventHandler(async (event) => {
    try {
        const user = requireApiUser(event);
        const companyId = requireCompanyId(event);
        const id = getRouterParam(event, 'id');

        // OWNER — любой материал компании; MANAGER/EMPLOYEE — общие + своих проектов.
        const scope = hasRole(user, EUserRole.OWNER)
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

        const material = await dbClient.material.findFirst({
            where: scope,
            include: {
                category: true,
                author: { select: { id: true, name: true, image: true } },
                project: { select: { id: true, name: true } },
            },
        });

        if (!material) throw createError({ statusCode: 404, message: 'Material not found' });

        return material;
    } catch (e) {
        logger.warn('Material detail/ get: ', e);
        throw e;
    }
});
