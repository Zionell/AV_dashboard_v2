import bcrypt from 'bcryptjs';
import type { PrismaClient } from '../../prisma/generated/prisma/index.js';
import { ECompanyPlan } from '../../shared/types/company.ts';
import { EUserRole } from '../../shared/types/user.ts';
import { ETodoStatus } from '../../shared/types/times.ts';
import { ETaskPriority } from '../../shared/types/todo.ts';
import { IDS, FIXTURE_EMAILS, FIXTURE_PASSWORD, FIXTURE_TOKENS } from './ids.ts';

const DAY = 24 * 60 * 60 * 1000;

/** Размер вложения в фикстурах — база для проверок квоты хранилища. */
export const FIXTURE_ATTACHMENT_SIZE = 1024 * 1024;

/** 1x1 PNG — настоящий, чтобы проходил проверку сигнатуры байт. */
export const FIXTURE_PNG =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

/**
 * Удаляет всё. Порядок — от зависимых к владельцам: в Mongo внешних ключей нет,
 * но так не остаётся висячих ссылок, если удаление где-то прервётся.
 */
export async function wipeDatabase(db: PrismaClient) {
    await db.event.deleteMany();
    await db.todoAttachment.deleteMany();
    await db.todoComment.deleteMany();
    await db.times.deleteMany();
    await db.todo.deleteMany();
    await db.material.deleteMany();
    await db.materialCategory.deleteMany();
    await db.usersOnProjects.deleteMany();
    await db.project.deleteMany();
    await db.invitation.deleteMany();
    await db.user.deleteMany();
    await db.company.deleteMany();
}

/**
 * Заливает детерминированный набор данных. Все id — из IDS, поэтому тесты
 * ссылаются на сущности напрямую, без предварительных выборок.
 */
export async function seedDatabase(db: PrismaClient) {
    const hash = await bcrypt.hash(FIXTURE_PASSWORD, 10);
    const now = Date.now();

    await db.company.createMany({
        data: [
            { id: IDS.company.acme, name: 'ACME', plan: ECompanyPlan.PRO },
            { id: IDS.company.solo, name: 'Solo', plan: ECompanyPlan.FREE },
            { id: IDS.company.rival, name: 'Rival', plan: ECompanyPlan.TEAM },
        ],
    });

    const user = (
        id: string,
        email: string,
        name: string,
        role: EUserRole,
        companyId: string | null,
        workHours = 8
    ) => ({
        id,
        email,
        name,
        role,
        companyId,
        workHours,
        hash,
        hasPassword: true,
    });

    await db.user.createMany({
        data: [
            user(IDS.user.acmeOwner, FIXTURE_EMAILS.acmeOwner, 'Acme Owner', EUserRole.OWNER, IDS.company.acme),
            user(IDS.user.acmeManager, FIXTURE_EMAILS.acmeManager, 'Acme Manager', EUserRole.MANAGER, IDS.company.acme),
            // Норма 6 часов — на нём проверяются личные нормы в расчётах времени.
            user(
                IDS.user.acmeEmployee,
                FIXTURE_EMAILS.acmeEmployee,
                'Acme Employee',
                EUserRole.EMPLOYEE,
                IDS.company.acme,
                6
            ),
            user(IDS.user.soloOwner, FIXTURE_EMAILS.soloOwner, 'Solo Owner', EUserRole.OWNER, IDS.company.solo),
            user(IDS.user.rivalOwner, FIXTURE_EMAILS.rivalOwner, 'Rival Owner', EUserRole.OWNER, IDS.company.rival),
            user(IDS.user.nomad, FIXTURE_EMAILS.nomad, 'Nomad', EUserRole.EMPLOYEE, null),
        ],
    });

    await db.project.createMany({
        data: [
            {
                id: IDS.project.apollo,
                name: 'Apollo',
                companyId: IDS.company.acme,
                priority: ETaskPriority.HIGH,
                links: [],
            },
            { id: IDS.project.secret, name: 'Secret', companyId: IDS.company.acme, links: [] },
            { id: IDS.project.rivalProject, name: 'Rival Project', companyId: IDS.company.rival, links: [] },
        ],
    });

    await db.usersOnProjects.createMany({
        data: [
            // Apollo — общий проект троих.
            { userId: IDS.user.acmeOwner, projectId: IDS.project.apollo, isCurrent: true },
            { userId: IDS.user.acmeManager, projectId: IDS.project.apollo },
            { userId: IDS.user.acmeEmployee, projectId: IDS.project.apollo },
            // Secret — только владелец, остальные не должны его видеть.
            { userId: IDS.user.acmeOwner, projectId: IDS.project.secret },
            { userId: IDS.user.rivalOwner, projectId: IDS.project.rivalProject },
        ],
    });

    await db.todo.createMany({
        data: [
            {
                id: IDS.todo.apolloOpen,
                name: 'Apollo open task',
                projectId: IDS.project.apollo,
                executorId: IDS.user.acmeEmployee,
                authorId: IDS.user.acmeOwner,
                status: ETodoStatus.TODO,
                priority: ETaskPriority.MEDIUM,
            },
            {
                id: IDS.todo.apolloInProgress,
                name: 'Apollo task in progress',
                projectId: IDS.project.apollo,
                executorId: IDS.user.acmeEmployee,
                authorId: IDS.user.acmeOwner,
                status: ETodoStatus.IN_PROGRESS,
                priority: ETaskPriority.HIGH,
            },
            {
                id: IDS.todo.secretTask,
                name: 'Secret task',
                projectId: IDS.project.secret,
                executorId: IDS.user.acmeOwner,
                authorId: IDS.user.acmeOwner,
                status: ETodoStatus.TODO,
            },
        ],
    });

    await db.materialCategory.createMany({
        data: [
            { id: IDS.category.acmeDocs, label: 'Docs', color: 'blue', companyId: IDS.company.acme },
            { id: IDS.category.rivalDocs, label: 'Docs', color: 'green', companyId: IDS.company.rival },
        ],
    });

    await db.material.create({
        data: {
            id: IDS.material.acmeGuide,
            name: 'Acme guide',
            sourceLink: 'https://acme.test/guide',
            categoryId: IDS.category.acmeDocs,
            companyId: IDS.company.acme,
            authorId: IDS.user.acmeOwner,
        },
    });

    await db.todoAttachment.create({
        data: {
            id: IDS.attachment.apolloShot,
            name: 'shot.png',
            data: FIXTURE_PNG,
            size: FIXTURE_ATTACHMENT_SIZE,
            todoId: IDS.todo.apolloOpen,
            authorId: IDS.user.acmeOwner,
            companyId: IDS.company.acme,
        },
    });

    await db.invitation.createMany({
        data: [
            {
                id: IDS.invitation.pending,
                email: FIXTURE_EMAILS.nomad,
                token: FIXTURE_TOKENS.pending,
                workHours: 4,
                companyId: IDS.company.acme,
                invitedById: IDS.user.acmeOwner,
                expiresAt: new Date(now + 7 * DAY),
            },
            {
                id: IDS.invitation.expired,
                email: FIXTURE_EMAILS.nomad,
                token: FIXTURE_TOKENS.expired,
                workHours: 8,
                companyId: IDS.company.acme,
                expiresAt: new Date(now - DAY),
            },
            {
                id: IDS.invitation.accepted,
                email: FIXTURE_EMAILS.nomad,
                token: FIXTURE_TOKENS.accepted,
                workHours: 8,
                companyId: IDS.company.acme,
                expiresAt: new Date(now + 7 * DAY),
                acceptedAt: new Date(now - DAY),
            },
        ],
    });
}

/** Сброс к исходному состоянию: используется тестами и стартом превью. */
export async function resetDatabase(db: PrismaClient) {
    await wipeDatabase(db);
    await seedDatabase(db);
}
