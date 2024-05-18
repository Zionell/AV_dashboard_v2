import type { Project } from '@prisma/client';
import type { UserItemType } from '~/types/user';

type ProjectTodoType = {
	isCompleted: boolean;
};

export interface IProject extends Project {
	users: UserItemType[];
	todo: ProjectTodoType[];
}

export type ProjectSpec = {
	id: string;
	name: string;
};
