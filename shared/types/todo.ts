import type { Todo } from '~~/prisma/generated/prisma';
import type { ETodoStatus } from '#shared/types/times';

/**
 * Приоритет задачи числом: чем больше, тем выше. В БД хранится как Int, чтобы сортировку
 * делала база (orderBy priority desc). В UI показываем текстовые лейблы, см. TASK_PRIORITY_LABEL.
 */
export enum ETaskPriority {
    LOW = 1,
    MEDIUM = 2,
    HIGH = 3,
}

export type TaskSortKey = 'newest' | 'oldest' | 'due' | 'priority';

export interface ITodoProgress {
    allTodos: number;
    completed: number;
}

interface ITaskPerson {
    id: string;
    name: string | null;
    image: string | null;
}

export interface ITaskCard extends Todo {
    status: ETodoStatus;
    executor: ITaskPerson | null;
    author: ITaskPerson | null;
    project: { id: string; name: string } | null;
    loggedMs: number;
    commentsCount: number;
    attachmentsCount: number;
}

export interface ITaskComment {
    id: string;
    text: string;
    todoId: string;
    author: ITaskPerson | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

/**
 * Метаданные вложения — без base64. Списки отдают только их: картинка на 2MB
 * весит ~2.7M символов base64, и тянуть их пачкой на каждое открытие задачи нельзя.
 * Сами байты запрашиваются поштучно, см. ITaskAttachmentFull.
 */
export interface ITaskAttachment {
    id: string;
    name: string;
    todoId: string;
    author: ITaskPerson | null;
    createdAt: Date | string;
}

/** Вложение вместе с содержимым — только из GET /api/todo/attachments/[id]. */
export interface ITaskAttachmentFull extends ITaskAttachment {
    data: string;
}
