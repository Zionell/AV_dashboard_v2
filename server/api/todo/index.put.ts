import { z } from 'zod';
import { prisma } from '~~/server/utils/prisma';
import { EUserRole } from '#shared/types/user';
import { ETodoStatus } from '#shared/types/times';
import { ETaskPriority } from '#shared/types/todo';
import { EProjectEventType } from '#shared/types/projects';

const bodySchema = z.object({
    name: z.string().trim().min(1).optional(),
    description: z.string().optional(),
    executorId: z.string().optional(),
    status: z.enum([ETodoStatus.TODO, ETodoStatus.IN_PROGRESS, ETodoStatus.REVIEW, ETodoStatus.DONE]).optional(),
    priority: z.enum(ETaskPriority).nullish(),
    dueDate: z.coerce.date().nullish(),
    estimateHours: z.number().int().positive().nullish(),
});

// Поля, которые разрешено менять employee (смена статуса на канбане).
const EMPLOYEE_FIELDS = ['status'];

export default defineEventHandler(async (event) => {
    try {
        const user = requireApiUser(event);
        const { id }: { id: string } = getQuery(event);
        const body = await readValidatedBody(event, bodySchema.parse);

        if (hasRole(user, EUserRole.EMPLOYEE)) {
            const extraFields = Object.keys(body).filter((key) => !EMPLOYEE_FIELDS.includes(key));

            if (extraFields.length) {
                throw createError({ statusCode: 403, message: 'Insufficient permissions' });
            }
        }

        if (body.executorId) {
            const executor = await prisma.user.findFirst({
                where: { id: body.executorId, companyId: requireCompanyId(event) },
                select: { id: true },
            });

            if (!executor) {
                throw createError({ statusCode: 400, message: 'Assignee is not from your company' });
            }
        }

        // projectScope: owner — вся компания, manager/employee — только свои проекты.
        const existing = await prisma.todo.findFirst({
            where: {
                id,
                project: projectScope(event),
            },
            select: {
                id: true,
                projectId: true,
                name: true,
                status: true,
                description: true,
                executorId: true,
                priority: true,
                dueDate: true,
                estimateHours: true,
            },
        });

        if (!existing) throw createError({ statusCode: 404, message: 'Task not found' });

        await prisma.todo.update({
            where: { id: existing.id },
            data: {
                ...body,
                // isCompleted следует за статусом: на нём держится закрытие проекта.
                ...(body.status ? { isCompleted: body.status === ETodoStatus.DONE } : {}),
            },
        });

        // Считаем реальную дельту: повторное сохранение формы без правок не должно засорять ленту.
        const isUnchanged = (key: keyof typeof body) => {
            const next = body[key];
            const current = existing[key as keyof typeof existing];

            if (next instanceof Date || current instanceof Date) {
                return (
                    (next ? new Date(next as Date).getTime() : null) ===
                    (current ? new Date(current as Date).getTime() : null)
                );
            }

            return (next ?? null) === (current ?? null);
        };

        const changedFields = (Object.keys(body) as (keyof typeof body)[]).filter((key) => !isUnchanged(key));
        const statusChanged = changedFields.includes('status');

        if (changedFields.length) {
            recordEvent(event, {
                type: statusChanged ? EProjectEventType.TASK_STATUS_CHANGED : EProjectEventType.TASK_UPDATED,
                projectId: existing.projectId,
                actorId: user.id,
                targetName: body.name ?? existing.name,
                ...(statusChanged ? { meta: { from: existing.status, to: body.status as string } } : {}),
            });
        }

        setResponseStatus(event, 204);
    } catch (e) {
        logger.warn('Todo/ put: ', e);
        throw e;
    }
});
