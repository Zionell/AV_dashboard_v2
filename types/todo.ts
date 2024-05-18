import type { Role, Todo, TodoStatus } from '@prisma/client';
import { z } from 'zod';

export interface ITodo extends Todo {
	todoStatus: TodoStatus;
	executor: {
		name: string | null;
		role: Role;
	};
}

const todoEditSchema = z.object({
	name: z.string(),
	description: z.string().optional(),
});

export type TodoEditSchema = z.output<typeof todoEditSchema>;
