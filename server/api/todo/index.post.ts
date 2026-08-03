import { z } from 'zod';
import { dbClient } from '~~/lib/dbClient';
import { EUserRole } from '#shared/types/user';
import { ETodoStatus } from '#shared/types/times';
import { ETaskPriority } from '#shared/types/todo';
import { EProjectEventType } from '#shared/types/projects';

const bodySchema = z.object({
    name: z.string().trim().min(1, 'Name is required'),
    description: z.string().optional(),
    projectId: z.string().min(1, 'Project is required'),
    executorId: z.string().min(1, 'Assignee is required'),
    status: z.enum([ETodoStatus.TODO, ETodoStatus.IN_PROGRESS, ETodoStatus.REVIEW, ETodoStatus.DONE]).optional(),
    priority: z.enum(ETaskPriority).optional(),
    dueDate: z.coerce.date().optional(),
    estimateHours: z.number().int().positive().optional(),
});

export default defineEventHandler(async (event) => {
    try {
        const user = requireRole(event, EUserRole.OWNER, EUserRole.MANAGER);
        const companyId = requireCompanyId(event);
        const body = await readValidatedBody(event, bodySchema.parse);

        // Менеджер может создавать задачи только в своих проектах, owner — в любых проектах компании.
        await requireProjectMembership(event, body.projectId);

        const executor = await dbClient.user.findFirst({
            where: { id: body.executorId, companyId },
            select: { id: true },
        });

        if (!executor) {
            throw createError({ statusCode: 400, message: 'Assignee is not from your company' });
        }

        const status = body.status ?? ETodoStatus.TODO;

        const todo = await dbClient.todo.create({
            data: {
                name: body.name,
                description: body.description ?? '',
                status,
                isCompleted: status === ETodoStatus.DONE,
                priority: body.priority,
                dueDate: body.dueDate,
                estimateHours: body.estimateHours,
                project: {
                    connect: {
                        id: body.projectId,
                    },
                },
                executor: {
                    connect: {
                        id: body.executorId,
                    },
                },
                author: {
                    connect: {
                        id: user.id,
                    },
                },
            },
        });

        recordEvent(event, {
            type: EProjectEventType.TASK_CREATED,
            projectId: body.projectId,
            actorId: user.id,
            targetName: todo.name,
        });

        setResponseStatus(event, 201);

        return todo;
    } catch (e) {
        logger.warn('Todo/ post: ', e);
        throw e;
    }
});
