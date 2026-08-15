import { z } from 'zod';
import { prisma } from '~~/server/utils/prisma';

const bodySchema = z.object({
    projectId: z.string().optional(),
    todoId: z.string().optional(),
});

export default defineEventHandler(async (event) => {
    const user = requireApiUser(event);
    const raw = await readBody(event).catch(() => ({}));
    const body = bodySchema.parse(raw ?? {});

    if (body.projectId) {
        await requireProjectMembership(event, body.projectId);
    }

    if (body.todoId) {
        if (!body.projectId) {
            throw createError({ statusCode: 400, message: 'A task must be specified together with a project' });
        }

        const todo = await prisma.todo.findFirst({
            where: { id: body.todoId, projectId: body.projectId },
            select: { id: true },
        });

        if (!todo) throw createError({ statusCode: 404, message: 'Task not found' });
    }

    return prisma.times.create({
        data: {
            active: true,
            user: {
                connect: {
                    id: user.id,
                },
            },
            ...(body.todoId ? { todo: { connect: { id: body.todoId } } } : {}),
        },
    });
});
