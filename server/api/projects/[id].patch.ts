import { z } from 'zod';
import { dbClient } from '~~/lib/dbClient';
import { EUserRole } from '#shared/types/user';
import { EProjectPriority, EProjectEventType } from '#shared/types/projects';

const bodySchema = z.object({
    name: z.string().trim().min(1).optional(),
    image: z.string().nullable().optional(),
    description: z.string().nullish(),
    client: z.string().nullish(),
    priority: z.enum(EProjectPriority).nullish(),
    startDate: z.coerce.date().nullish(),
    deadline: z.coerce.date().nullish(),
    budget: z.number().int().nonnegative().nullish(),
    links: z
        .array(
            z.object({
                name: z.string().trim().min(1),
                url: z.url('Invalid URL'),
            })
        )
        .optional(),
    users: z.array(z.string()).optional(),
});

export default defineEventHandler(async (event) => {
    try {
        const user = requireRole(event, EUserRole.OWNER, EUserRole.MANAGER);
        const companyId = requireCompanyId(event);
        const id = getRouterParam(event, 'id');

        // Менеджер редактирует только свои проекты, owner — любые в компании.
        const projectId = await requireProjectMembership(event, id);
        const body = await readValidatedBody(event, bodySchema.parse);

        const { users, links, ...fields } = body;

        await dbClient.project.update({
            where: { id: projectId },
            data: {
                ...fields,
                ...(links ? { links: { set: links } } : {}),
            },
        });

        // Синк участников: полный список из формы.
        if (users) {
            const keep = [...users];

            // Менеджер не может выкинуть себя — потеряет доступ к проекту.
            if (hasRole(user, EUserRole.MANAGER) && !keep.includes(user.id)) {
                keep.push(user.id);
            }

            if (keep.length) {
                const members = await dbClient.user.count({
                    where: { id: { in: keep }, companyId },
                });

                if (members !== keep.length) {
                    throw createError({ statusCode: 400, message: 'User is not from your company' });
                }
            }

            const existing = await dbClient.usersOnProjects.findMany({
                where: { projectId },
                select: { userId: true },
            });
            const existingIds = existing.map((e) => e.userId);
            const toAdd = keep.filter((userId) => !existingIds.includes(userId));

            await dbClient.usersOnProjects.deleteMany({
                where: { projectId, userId: { notIn: keep } },
            });

            // Mongo падает на createMany с пустым массивом.
            if (toAdd.length) {
                await dbClient.usersOnProjects.createMany({
                    data: toAdd.map((userId) => ({ projectId, userId })),
                });
            }
        }

        recordEvent(event, {
            type: EProjectEventType.PROJECT_UPDATED,
            projectId,
            actorId: user.id,
        });

        setResponseStatus(event, 204);
    } catch (e) {
        logger.warn('Project/ patch: ', e);
        throw e;
    }
});
