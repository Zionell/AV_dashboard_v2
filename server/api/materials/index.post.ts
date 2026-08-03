import { z } from 'zod';
import { dbClient } from '~~/lib/dbClient';
import { EUserRole } from '#shared/types/user';

const bodySchema = z.object({
    name: z.string().trim().min(1, 'Name is required'),
    description: z.string().optional(),
    sourceLink: z.string().trim().min(1, 'Link is required'),
    categoryId: z.string().min(1, 'Category is required'),
    projectId: z.string().optional(),
});

export default defineEventHandler(async (event) => {
    try {
        const user = requireRole(event, EUserRole.OWNER, EUserRole.MANAGER);
        const companyId = requireCompanyId(event);
        const body = await readValidatedBody(event, bodySchema.parse);

        if (body.projectId) {
            // Менеджер прикрепляет материал только к своим проектам.
            await requireProjectMembership(event, body.projectId);
        }

        await requireCategoryInScope(event, body.categoryId);

        const material = await dbClient.material.create({
            data: {
                name: body.name,
                description: body.description ?? '',
                sourceLink: body.sourceLink,
                company: {
                    connect: {
                        id: companyId,
                    },
                },
                category: {
                    connect: {
                        id: body.categoryId,
                    },
                },
                author: {
                    connect: {
                        id: user.id,
                    },
                },
                ...(body.projectId
                    ? {
                          project: {
                              connect: {
                                  id: body.projectId,
                              },
                          },
                      }
                    : {}),
            },
        });

        setResponseStatus(event, 201);

        return material;
    } catch (e) {
        logger.warn('Material/ post: ', e);
        throw e;
    }
});
