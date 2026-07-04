import type { Project } from '~~/generated/prisma';
import type { IUserShort } from '#shared/types/user';

interface IProjectTodo {
    isCompleted: boolean;
}

export interface IProject extends Project {
    todo: IProjectTodo[];
    users: IUserShort[];
}
