/**
 * Сид демо-данных в рабочую базу (DATABASE_URL из .env).
 *
 * Заменил бывший демо-режим (кука `demo` + копия API на /preview/** с данными в памяти):
 * вместо подмены эндпоинтов есть обычный аккаунт test@test.com / test12345, который ходит
 * по настоящему API и по настоящей базе.
 *
 * Скрипт идемпотентный и точечный: сносит только демо-компанию со всем её содержимым
 * (по фиксированным id из demo-data.ts) и заливает заново. Остальные данные не трогает.
 *
 *   npm run db:seed-demo
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../prisma/generated/prisma/client.ts';
import { ECompanyPlan } from '../shared/types/company.ts';
import { ETodoStatus } from '../shared/types/times.ts';
import {
    COMMENTS,
    CATEGORIES,
    DEMO_EMAIL,
    DEMO_PASSWORD,
    IDS,
    MATERIALS,
    PROJECTS,
    TODOS,
    USERS,
    buildEvents,
    buildTimes,
    commentAt,
    dayAt,
    todoId,
} from './demo-data.ts';

const HOUR = 60 * 60 * 1000;

/**
 * Снос прошлого сида. Только демо-компания и её содержимое — от зависимых сущностей
 * к владельцам, чтобы не осталось висячих ссылок, если удаление прервётся.
 */
async function wipeDemo(db: PrismaClient) {
    const users = await db.user.findMany({
        where: { OR: [{ companyId: IDS.company }, { email: DEMO_EMAIL }] },
        select: { id: true },
    });
    const projects = await db.project.findMany({ where: { companyId: IDS.company }, select: { id: true } });

    const userIds = users.map((u) => u.id);
    const projectIds = projects.map((p) => p.id);

    await db.event.deleteMany({ where: { projectId: { in: projectIds } } });
    await db.todoAttachment.deleteMany({ where: { companyId: IDS.company } });
    await db.todoComment.deleteMany({ where: { todo: { projectId: { in: projectIds } } } });
    await db.times.deleteMany({ where: { userId: { in: userIds } } });
    await db.todo.deleteMany({ where: { projectId: { in: projectIds } } });
    await db.material.deleteMany({ where: { companyId: IDS.company } });
    await db.materialCategory.deleteMany({ where: { companyId: IDS.company } });
    await db.usersOnProjects.deleteMany({
        where: { OR: [{ projectId: { in: projectIds } }, { userId: { in: userIds } }] },
    });
    await db.project.deleteMany({ where: { companyId: IDS.company } });
    await db.invitation.deleteMany({ where: { companyId: IDS.company } });
    await db.user.deleteMany({ where: { id: { in: userIds } } });
    await db.company.deleteMany({ where: { id: IDS.company } });
}

async function seedDemo(db: PrismaClient) {
    const hash = await bcrypt.hash(DEMO_PASSWORD, 10);

    await db.company.create({
        data: { id: IDS.company, name: 'Preview Studio', plan: ECompanyPlan.PRO },
    });

    await db.user.createMany({
        data: USERS.map((u) => ({
            id: u.id,
            email: u.email,
            name: u.name,
            role: u.role,
            bio: u.bio,
            workHours: u.workHours,
            companyId: IDS.company,
            hash,
            hasPassword: true,
        })),
    });

    await db.project.createMany({
        data: PROJECTS.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            client: p.client,
            priority: p.priority,
            budget: p.budget,
            startDate: dayAt(p.startsInDays, 10),
            deadline: dayAt(p.deadlineInDays, 18),
            companyId: IDS.company,
            links: [],
        })),
    });

    await db.usersOnProjects.createMany({
        data: PROJECTS.flatMap((p) =>
            p.members.map((userId) => ({
                userId,
                projectId: p.id,
                // isCurrent сейчас нигде не читается — помечаем один проект владельца,
                // чтобы поле не было пустым во всей коллекции.
                isCurrent: userId === IDS.user.owner && p.id === IDS.project.crm,
            }))
        ),
    });

    await db.todo.createMany({
        data: TODOS.map((t, i) => ({
            id: todoId(t.n),
            name: t.name,
            description: t.description,
            status: t.status,
            priority: t.priority,
            estimateHours: t.estimateHours,
            dueDate: t.dueInDays === null ? null : dayAt(t.dueInDays, 18),
            isCompleted: t.status === ETodoStatus.DONE,
            projectId: t.projectId,
            executorId: t.executorId,
            authorId: t.authorId,
            createdAt: new Date(Date.now() - (i + 1) * 3 * HOUR),
            updatedAt: new Date(Date.now() - i * HOUR),
        })),
    });

    await db.materialCategory.createMany({
        data: CATEGORIES.map((c) => ({ ...c, companyId: IDS.company })),
    });

    await db.material.createMany({
        data: MATERIALS.map((m) => ({ ...m, companyId: IDS.company })),
    });

    await db.todoComment.createMany({
        data: COMMENTS.map((c) => ({
            text: c.text,
            todoId: todoId(c.todo),
            authorId: c.authorId,
            createdAt: commentAt(c.agoDays),
            updatedAt: commentAt(c.agoDays),
        })),
    });

    await db.times.createMany({ data: buildTimes() });
    await db.event.createMany({ data: buildEvents() });
}

const url = process.env.DATABASE_URL;

if (!url) {
    throw new Error('DATABASE_URL не задан — некуда заливать демо-данные');
}

const dbName = new URL(url).pathname.slice(1);

const db = new PrismaClient({ datasources: { db: { url } } });

try {
    await wipeDemo(db);
    await seedDemo(db);

    const counts = {
        пользователей: await db.user.count({ where: { companyId: IDS.company } }),
        проектов: await db.project.count({ where: { companyId: IDS.company } }),
        задач: await db.todo.count({ where: { project: { companyId: IDS.company } } }),
        комментариев: await db.todoComment.count({ where: { todo: { project: { companyId: IDS.company } } } }),
        материалов: await db.material.count({ where: { companyId: IDS.company } }),
        сессий: await db.times.count({ where: { user: { companyId: IDS.company } } }),
        событий: await db.event.count({ where: { project: { companyId: IDS.company } } }),
    };

    console.log(`База «${dbName}» — демо-данные залиты:`, JSON.stringify(counts));
    console.log(`Вход: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
} finally {
    await db.$disconnect();
}
