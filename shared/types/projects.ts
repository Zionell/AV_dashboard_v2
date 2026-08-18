import type { Project } from '~/generated/prisma/client';
import type { IUserShort } from '#shared/types/user';
import type { ETodoStatus } from '#shared/types/times';

/**
 * Приоритет проекта числом — та же конвенция, что и у задач (см. ETaskPriority):
 * чем больше, тем выше. В UI показываем текстовые лейблы.
 */
export enum EProjectPriority {
    LOW = 1,
    MEDIUM = 2,
    HIGH = 3,
}

interface IProjectTodo {
    isCompleted: boolean;
}

export interface IProject extends Project {
    todo: IProjectTodo[];
    // Список проектов (/api/projects) участников не отдаёт — карточке они не нужны.
    users?: IUserShort[];
}

export interface IProjectMemberStat extends IUserShort {
    todayMs: number;
    weekMs: number;
    tasksCount: number;
}

export interface IProjectRecentTask {
    id: string;
    name: string;
    status: ETodoStatus;
    updatedAt: string;
}

export interface IProjectMaterialShort {
    id: string;
    name: string;
    category: { label: string; color: string } | null;
}

export interface IProjectStats {
    totalTasks: number;
    completedTasks: number;
    membersCount: number;
    totalTimeMs: number;
    byStatus: Record<ETodoStatus, number>;
}

export enum EProjectEventType {
    PROJECT_CREATED = 'PROJECT_CREATED',
    PROJECT_UPDATED = 'PROJECT_UPDATED',
    TASK_CREATED = 'TASK_CREATED',
    TASK_UPDATED = 'TASK_UPDATED',
    TASK_STATUS_CHANGED = 'TASK_STATUS_CHANGED',
    TASK_DELETED = 'TASK_DELETED',
    COMMENT_ADDED = 'COMMENT_ADDED',
    ATTACHMENT_ADDED = 'ATTACHMENT_ADDED',
}

export interface IProjectEvent {
    id: string;
    type: EProjectEventType;
    actor: { id: string; name: string | null; image: string | null } | null;
    targetName: string | null;
    /** Доп. данные, напр. { from: 'TODO', to: 'DONE' }. */
    meta: Record<string, string> | null;
    createdAt: Date | string;
}

export interface IProjectDetail extends Project {
    /** Все задачи выполнены (и они есть) — проект закрыт. */
    isClosed: boolean;
    stats: IProjectStats;
    members: IProjectMemberStat[];
    recentTasks: IProjectRecentTask[];
    materials: IProjectMaterialShort[];
    events: IProjectEvent[];
}
