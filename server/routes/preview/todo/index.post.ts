import { previewDb, previewId, type PreviewTodo } from '~~/server/utils/preview/store';

// Копия POST /api/todo: создаём задачу в памяти демо-стора.
export default defineEventHandler(async (event) => {
    const db = previewDb();
    const body = await readBody(event);
    const now = new Date().toISOString();
    const status = body.status || 'TODO';

    const todo: PreviewTodo = {
        id: previewId('dt'),
        name: body.name,
        description: body.description || '',
        status,
        priority: body.priority ?? 2,
        dueDate: body.dueDate ? new Date(body.dueDate).toISOString() : null,
        isCompleted: status === 'DONE',
        estimateHours: body.estimateHours ?? null,
        projectId: body.projectId,
        executorId: body.executorId || null,
        authorId: db.user.id,
        createdAt: now,
        updatedAt: now,
    };

    db.todos.unshift(todo);
    setResponseStatus(event, 201);

    return todo;
});
