import { previewDb } from '~~/server/utils/preview/store';

// Копия PUT /api/todo?id=…: правка задачи (полное редактирование, статус из канбана и т.п.).
export default defineEventHandler(async (event) => {
    const db = previewDb();
    const { id } = getQuery<{ id?: string }>(event);
    const body = await readBody(event);
    const todo = db.todos.find((t) => t.id === id);

    if (!todo) throw createError({ statusCode: 404, message: 'Task not found' });

    if (body.name !== undefined) todo.name = body.name;
    if (body.description !== undefined) todo.description = body.description;
    if (body.executorId !== undefined) todo.executorId = body.executorId;
    if (body.status !== undefined) {
        todo.status = body.status;
        todo.isCompleted = body.status === 'DONE';
    }
    if (body.priority !== undefined) todo.priority = body.priority;
    if (body.dueDate !== undefined) todo.dueDate = body.dueDate ? new Date(body.dueDate).toISOString() : null;
    if (body.estimateHours !== undefined) todo.estimateHours = body.estimateHours;

    todo.updatedAt = new Date().toISOString();
    setResponseStatus(event, 204);

    return null;
});
