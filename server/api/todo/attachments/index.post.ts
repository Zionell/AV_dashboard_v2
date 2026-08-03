import { z } from 'zod';
import { dbClient } from '~~/lib/dbClient';
import { EProjectEventType } from '#shared/types/projects';
import { MAX_ATTACHMENTS_PER_TASK } from '#shared/constants';

/**
 * Проверка по сигнатуре первых байт: префикса `data:image/` мало — его легко подделать.
 * Декодируем начало base64 и сверяем magic bytes.
 */
function isRealImage(dataUri: string): boolean {
    const base64 = dataUri.slice(dataUri.indexOf(',') + 1, dataUri.indexOf(',') + 33);

    let head: Buffer;

    try {
        head = Buffer.from(base64, 'base64');
    } catch {
        return false;
    }

    if (head.length < 12) return false;

    const startsWith = (...bytes: number[]) => bytes.every((b, i) => head[i] === b);

    return (
        startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a) || // PNG
        startsWith(0xff, 0xd8, 0xff) || // JPEG
        startsWith(0x47, 0x49, 0x46, 0x38) || // GIF87a/GIF89a
        // WEBP: RIFF....WEBP
        (startsWith(0x52, 0x49, 0x46, 0x46) &&
            head[8] === 0x57 &&
            head[9] === 0x45 &&
            head[10] === 0x42 &&
            head[11] === 0x50)
    );
}

/** Размер файла в байтах по длине base64 — декодировать ради этого всю строку не нужно. */
function decodedSize(dataUri: string): number {
    const base64 = dataUri.slice(dataUri.indexOf(',') + 1);
    const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;

    return Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
}

const bodySchema = z.object({
    todoId: z.string().min(1),
    name: z.string().trim().min(1).max(200),
    // base64 data URI, только изображения; ~2MB файла ≈ 2.8M символов base64
    data: z
        .string()
        .max(3_000_000, 'Image is too large (max ~2MB)')
        .regex(/^data:image\/[a-z+]+;base64,/, 'Only images can be attached')
        .refine(isRealImage, 'Only images can be attached'),
});

// Прикладывать изображения могут все участники проекта задачи.
export default defineEventHandler(async (event) => {
    try {
        const user = requireApiUser(event);
        const companyId = requireCompanyId(event);
        const body = await readValidatedBody(event, bodySchema.parse);

        const todo = await requireTodoInScope(event, body.todoId);
        const size = decodedSize(body.data);

        const attachmentCount = await dbClient.todoAttachment.count({ where: { todoId: body.todoId } });

        if (attachmentCount >= MAX_ATTACHMENTS_PER_TASK) {
            throw createError({
                statusCode: 400,
                message: `Attachment limit reached: up to ${MAX_ATTACHMENTS_PER_TASK} files per task.`,
            });
        }

        await assertStorageQuota(companyId, size);

        // Возвращаем только метаданные — клиент уже держит загруженный файл у себя,
        // эхо base64 обратно удвоило бы трафик на пустом месте.
        const attachment = await dbClient.todoAttachment.create({
            data: {
                name: body.name,
                data: body.data,
                size,
                todoId: body.todoId,
                authorId: user.id,
                companyId,
            },
            select: {
                id: true,
                name: true,
                todoId: true,
                createdAt: true,
                author: { select: { id: true, name: true, image: true } },
            },
        });

        recordEvent(event, {
            type: EProjectEventType.ATTACHMENT_ADDED,
            projectId: todo.projectId,
            actorId: user.id,
            targetName: todo.name,
        });

        setResponseStatus(event, 201);

        return attachment;
    } catch (e) {
        logger.warn('Todo/attachments post: ', e);
        throw e;
    }
});
