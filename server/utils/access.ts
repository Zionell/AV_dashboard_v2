import type { H3Event } from 'h3';
import { dbClient } from '~~/lib/dbClient';
import { EUserRole } from '#shared/types/user';

type ApiUser = {
    id: string;
    email: string;
    role: string;
    companyId: string | null;
};

export function requireApiUser(event: H3Event): ApiUser {
    const user = event.context.user;

    if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' });

    return user;
}

export function requireCompanyId(event: H3Event): string {
    const user = requireApiUser(event);

    if (!user.companyId) throw createError({ statusCode: 403, message: 'Company is not set up' });

    return user.companyId;
}

export function hasRole(user: Pick<ApiUser, 'role'>, ...roles: EUserRole[]): boolean {
    return roles.includes(user.role as EUserRole);
}

export function requireRole(event: H3Event, ...roles: EUserRole[]): ApiUser {
    const user = requireApiUser(event);

    if (!hasRole(user, ...roles)) {
        throw createError({ statusCode: 403, message: 'Insufficient permissions' });
    }

    return user;
}

export async function requireProjectInCompany(event: H3Event, projectId: string | undefined): Promise<string> {
    const companyId = requireCompanyId(event);

    const project = projectId
        ? await dbClient.project.findFirst({
              where: { id: projectId, companyId },
              select: { id: true },
          })
        : null;

    if (!project) throw createError({ statusCode: 404, message: 'Project not found' });

    return project.id;
}

/**
 * OWNER — любой проект компании; MANAGER/EMPLOYEE — только проекты, где они участники.
 * 404 вместо 403, чтобы не раскрывать существование чужого проекта.
 */
export async function requireProjectMembership(event: H3Event, projectId: string | undefined): Promise<string> {
    const user = requireApiUser(event);

    if (hasRole(user, EUserRole.OWNER)) {
        return requireProjectInCompany(event, projectId);
    }

    const companyId = requireCompanyId(event);

    const membership = projectId
        ? await dbClient.usersOnProjects.findFirst({
              where: {
                  projectId,
                  userId: user.id,
                  project: { companyId },
              },
              select: { id: true },
          })
        : null;

    if (!membership) throw createError({ statusCode: 404, message: 'Project not found' });

    return projectId as string;
}

/** Задача доступна, если её проект в скоупе пользователя. 404, чтобы не раскрывать чужие задачи. */
export async function requireTodoInScope(
    event: H3Event,
    todoId: string | undefined
): Promise<{ id: string; projectId: string; name: string }> {
    const todo = todoId
        ? await dbClient.todo.findFirst({
              where: { id: todoId, project: projectScope(event) },
              select: { id: true, projectId: true, name: true },
          })
        : null;

    if (!todo) throw createError({ statusCode: 404, message: 'Task not found' });

    return todo;
}

/**
 * Категория материала должна быть из своей компании. Без этой проверки материал
 * можно было бы привязать к чужой категории по угаданному id — и скоуп справочника
 * обходился бы с другой стороны.
 */
export async function requireCategoryInScope(event: H3Event, categoryId: string | undefined): Promise<string> {
    const companyId = requireCompanyId(event);

    const category = categoryId
        ? await dbClient.materialCategory.findFirst({
              where: { id: categoryId, companyId },
              select: { id: true },
          })
        : null;

    if (!category) throw createError({ statusCode: 404, message: 'Category not found' });

    return category.id;
}

/** Prisma-фильтр списка проектов: OWNER — вся компания, остальные — по членству. */
export function projectScope(event: H3Event) {
    const user = requireApiUser(event);
    const companyId = requireCompanyId(event);

    if (hasRole(user, EUserRole.OWNER)) {
        return { companyId };
    }

    return {
        companyId,
        users: {
            some: {
                userId: user.id,
            },
        },
    };
}
