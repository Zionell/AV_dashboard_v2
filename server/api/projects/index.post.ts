import { z } from 'zod';
import { prisma } from '~~/server/utils/prisma';
import { EUserRole } from '#shared/types/user';
import { EProjectPriority, EProjectEventType } from '#shared/types/projects';

const bodySchema = z.object({
    name: z.string().trim().min(1, 'Project name is required'),
    image: z.string().nullable().optional(),
    description: z.string().optional(),
    client: z.string().optional(),
    priority: z.enum(EProjectPriority).optional(),
    startDate: z.coerce.date().optional(),
    deadline: z.coerce.date().optional(),
    budget: z.number().int().nonnegative().optional(),
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
        const body = await readValidatedBody(event, bodySchema.parse);

        await assertProjectAvailable(companyId);

        const usersArr = body.users ?? [];

        // Менеджер видит только свои проекты — добавляем его участником, иначе он потеряет доступ к созданному.
        if (hasRole(user, EUserRole.MANAGER) && !usersArr.includes(user.id)) {
            usersArr.push(user.id);
        }

        if (usersArr.length) {
            const members = await prisma.user.count({
                where: {
                    id: { in: usersArr },
                    companyId,
                },
            });

            if (members !== usersArr.length) {
                throw createError({ statusCode: 400, message: 'User is not from your company' });
            }
        }

        const project = await prisma.project.create({
            data: {
                name: body.name,
                image: body.image ?? null,
                description: body.description,
                client: body.client,
                priority: body.priority,
                startDate: body.startDate,
                deadline: body.deadline,
                budget: body.budget,
                links: body.links ?? [],
                company: {
                    connect: {
                        id: companyId,
                    },
                },
                users: {
                    create: [
                        ...usersArr.map((userId: string) => ({
                            user: {
                                connect: {
                                    id: userId,
                                },
                            },
                        })),
                    ],
                },
            },
        });

        recordEvent(event, {
            type: EProjectEventType.PROJECT_CREATED,
            projectId: project.id,
            actorId: user.id,
            targetName: project.name,
        });

        setResponseStatus(event, 201);

        return project;
    } catch (e) {
        logger.warn('Projects/ post: ', e);
        throw e;
    }
});
