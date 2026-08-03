import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { H3Event } from 'h3';
import { EUserRole } from '#shared/types/user';

vi.mock('~~/lib/dbClient', () => ({
    dbClient: {
        project: { findFirst: vi.fn() },
        usersOnProjects: { findFirst: vi.fn() },
        todo: { findFirst: vi.fn() },
        materialCategory: { findFirst: vi.fn() },
    },
}));

const { dbClient } = await import('~~/lib/dbClient');
const {
    requireApiUser,
    requireCompanyId,
    hasRole,
    requireRole,
    requireProjectInCompany,
    requireProjectMembership,
    requireTodoInScope,
    requireCategoryInScope,
    projectScope,
} = await import('~~/server/utils/access');

const db = dbClient as unknown as {
    project: { findFirst: ReturnType<typeof vi.fn> };
    usersOnProjects: { findFirst: ReturnType<typeof vi.fn> };
    todo: { findFirst: ReturnType<typeof vi.fn> };
    materialCategory: { findFirst: ReturnType<typeof vi.fn> };
};

/** Событие с нужным пользователем в контексте — как его кладёт серверный middleware. */
function eventAs(user: { id?: string; role?: EUserRole; companyId?: string | null } | null): H3Event {
    return {
        context: {
            user:
                user === null
                    ? null
                    : { id: 'u1', email: 'u@test', role: EUserRole.EMPLOYEE, companyId: 'c1', ...user },
        },
    } as unknown as H3Event;
}

async function expectStatus(promise: Promise<unknown>, statusCode: number) {
    await expect(promise).rejects.toMatchObject({ statusCode });
}

beforeEach(() => {
    vi.clearAllMocks();
});

describe('requireApiUser', () => {
    it('отдаёт пользователя из контекста', () => {
        expect(requireApiUser(eventAs({ id: 'u42' })).id).toBe('u42');
    });

    it('без пользователя — 401', () => {
        expect(() => requireApiUser(eventAs(null))).toThrowError(expect.objectContaining({ statusCode: 401 }));
    });
});

describe('requireCompanyId', () => {
    it('отдаёт компанию', () => {
        expect(requireCompanyId(eventAs({ companyId: 'c9' }))).toBe('c9');
    });

    it('без компании — 403, а не 401', () => {
        // Пользователь есть, но онбординг не пройден — это другой случай.
        expect(() => requireCompanyId(eventAs({ companyId: null }))).toThrowError(
            expect.objectContaining({ statusCode: 403 })
        );
    });
});

describe('роли', () => {
    it.each([
        [EUserRole.OWNER, [EUserRole.OWNER], true],
        [EUserRole.MANAGER, [EUserRole.OWNER], false],
        [EUserRole.MANAGER, [EUserRole.OWNER, EUserRole.MANAGER], true],
        [EUserRole.EMPLOYEE, [EUserRole.OWNER, EUserRole.MANAGER], false],
    ])('hasRole(%s, %j) === %s', (role, allowed, expected) => {
        expect(hasRole({ role }, ...allowed)).toBe(expected);
    });

    it('requireRole пропускает разрешённую роль', () => {
        expect(requireRole(eventAs({ role: EUserRole.OWNER }), EUserRole.OWNER).role).toBe(EUserRole.OWNER);
    });

    it('requireRole отбивает чужую роль 403', () => {
        expect(() => requireRole(eventAs({ role: EUserRole.EMPLOYEE }), EUserRole.OWNER)).toThrowError(
            expect.objectContaining({ statusCode: 403 })
        );
    });
});

describe('projectScope', () => {
    it('владельцу — вся компания', () => {
        expect(projectScope(eventAs({ role: EUserRole.OWNER, companyId: 'c1' }))).toEqual({ companyId: 'c1' });
    });

    it.each([EUserRole.MANAGER, EUserRole.EMPLOYEE])('%s — только свои проекты', (role) => {
        expect(projectScope(eventAs({ role, id: 'u7', companyId: 'c1' }))).toEqual({
            companyId: 'c1',
            users: { some: { userId: 'u7' } },
        });
    });
});

describe('requireProjectInCompany', () => {
    it('отдаёт id проекта своей компании', async () => {
        db.project.findFirst.mockResolvedValue({ id: 'p1' });

        await expect(requireProjectInCompany(eventAs({}), 'p1')).resolves.toBe('p1');
        expect(db.project.findFirst).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id: 'p1', companyId: 'c1' } })
        );
    });

    it('чужой проект — 404, а не 403', async () => {
        // Код намеренно не раскрывает существование чужих объектов.
        db.project.findFirst.mockResolvedValue(null);

        await expectStatus(requireProjectInCompany(eventAs({}), 'foreign'), 404);
    });

    it('без id — 404 и без похода в БД', async () => {
        await expectStatus(requireProjectInCompany(eventAs({}), undefined), 404);
        expect(db.project.findFirst).not.toHaveBeenCalled();
    });
});

describe('requireProjectMembership', () => {
    it('владельцу членство не нужно — хватает компании', async () => {
        db.project.findFirst.mockResolvedValue({ id: 'p1' });

        await expect(requireProjectMembership(eventAs({ role: EUserRole.OWNER }), 'p1')).resolves.toBe('p1');
        expect(db.usersOnProjects.findFirst).not.toHaveBeenCalled();
    });

    it('сотруднику нужна запись об участии', async () => {
        db.usersOnProjects.findFirst.mockResolvedValue({ id: 'link1' });

        await expect(requireProjectMembership(eventAs({ role: EUserRole.EMPLOYEE, id: 'u7' }), 'p1')).resolves.toBe(
            'p1'
        );
        expect(db.usersOnProjects.findFirst).toHaveBeenCalledWith(
            expect.objectContaining({ where: expect.objectContaining({ projectId: 'p1', userId: 'u7' }) })
        );
    });

    it('не участник — 404', async () => {
        db.usersOnProjects.findFirst.mockResolvedValue(null);

        await expectStatus(requireProjectMembership(eventAs({ role: EUserRole.MANAGER }), 'p1'), 404);
    });
});

describe('requireTodoInScope', () => {
    it('отдаёт задачу в скоупе', async () => {
        db.todo.findFirst.mockResolvedValue({ id: 't1', projectId: 'p1', name: 'Task' });

        await expect(requireTodoInScope(eventAs({}), 't1')).resolves.toEqual({
            id: 't1',
            projectId: 'p1',
            name: 'Task',
        });
    });

    it('фильтрует по скоупу проектов пользователя', async () => {
        db.todo.findFirst.mockResolvedValue({ id: 't1', projectId: 'p1', name: 'Task' });

        await requireTodoInScope(eventAs({ role: EUserRole.EMPLOYEE, id: 'u7' }), 't1');

        expect(db.todo.findFirst).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 't1', project: { companyId: 'c1', users: { some: { userId: 'u7' } } } },
            })
        );
    });

    it('чужая задача — 404', async () => {
        db.todo.findFirst.mockResolvedValue(null);

        await expectStatus(requireTodoInScope(eventAs({}), 'foreign'), 404);
    });
});

describe('requireCategoryInScope', () => {
    it('отдаёт категорию своей компании', async () => {
        db.materialCategory.findFirst.mockResolvedValue({ id: 'cat1' });

        await expect(requireCategoryInScope(eventAs({}), 'cat1')).resolves.toBe('cat1');
        expect(db.materialCategory.findFirst).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id: 'cat1', companyId: 'c1' } })
        );
    });

    it('чужая категория — 404', async () => {
        // Иначе материал можно было бы привязать к чужой категории по угаданному id.
        db.materialCategory.findFirst.mockResolvedValue(null);

        await expectStatus(requireCategoryInScope(eventAs({}), 'foreign-cat'), 404);
    });

    it('без id — 404 и без похода в БД', async () => {
        await expectStatus(requireCategoryInScope(eventAs({}), undefined), 404);
        expect(db.materialCategory.findFirst).not.toHaveBeenCalled();
    });
});
