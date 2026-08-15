import { z } from 'zod';
import { prisma } from '~~/server/utils/prisma';
import { EUserRole } from '#shared/types/user';

const bodySchema = z.object({
    name: z.string().trim().min(1).optional(),
    description: z.string().optional(),
    sourceLink: z.string().trim().min(1).optional(),
    categoryId: z.string().optional(),
    // null — открепить от проекта (сделать общим).
    projectId: z.string().nullable().optional(),
});

export default defineEventHandler(async (event) => {
    try {
        const user = requireRole(event, EUserRole.OWNER, EUserRole.MANAGER);
        const companyId = requireCompanyId(event);
        const id = getRouterParam(event, 'id');
        const body = await readValidatedBody(event, bodySchema.parse);

        // OWNER — любой материал компании; MANAGER — общие + своих проектов.
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

        const material = await prisma.material.findFirst({ where: scope, select: { id: true } });

        if (!material) throw createError({ statusCode: 404, message: 'Material not found' });

        if (body.projectId) {
            await requireProjectMembership(event, body.projectId);
        }

        if (body.categoryId) {
            await requireCategoryInScope(event, body.categoryId);
        }

        const { projectId, ...rest } = body;

        const updated = await prisma.material.update({
            where: { id: material.id },
            data: {
                ...rest,
                ...(projectId !== undefined ? { projectId } : {}),
            },
            include: {
                category: true,
                author: { select: { id: true, name: true, image: true } },
                project: { select: { id: true, name: true } },
            },
        });

        return updated;
    } catch (e) {
        logger.warn('Material/ patch: ', e);
        throw e;
    }
});
