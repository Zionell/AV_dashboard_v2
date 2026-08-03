import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { setup } from '@nuxt/test-utils/e2e';
import { fileURLToPath } from 'node:url';
import { signedInAs, resetFixtures, testDb, useTestDatabaseEnv } from './harness.ts';
import { FIXTURE_EMAILS, IDS } from '../fixtures/ids.ts';
import { FIXTURE_PNG } from '../fixtures/seed.ts';
import { MAX_ATTACHMENTS_PER_TASK } from '../../shared/constants.ts';

useTestDatabaseEnv();

await setup({
    rootDir: fileURLToPath(new URL('../..', import.meta.url)),
    server: true,
    browser: false,
    // Против dev-сервера — прод-сборка падает на Prisma __dirname (см. docs/audit.md).
    dev: true,
});

beforeAll(async () => {
    await resetFixtures();
});

beforeEach(async () => {
    await resetFixtures();
});

const message = (data: unknown) => String((data as { message?: string })?.message);

describe('Лимит вложений на задачу', () => {
    it(`при ${MAX_ATTACHMENTS_PER_TASK} вложениях новое отбивается 400`, async () => {
        // В фикстурах у задачи уже одно вложение — добираем до потолка напрямую в БД.
        const db = testDb();

        await db.todoAttachment.createMany({
            data: Array.from({ length: MAX_ATTACHMENTS_PER_TASK - 1 }, (_, i) => ({
                name: `extra-${i}.png`,
                data: FIXTURE_PNG,
                size: 100,
                todoId: IDS.todo.apolloOpen,
                authorId: IDS.user.acmeOwner,
                companyId: IDS.company.acme,
            })),
        });

        await db.$disconnect();

        const owner = await signedInAs(FIXTURE_EMAILS.acmeOwner);
        const res = await owner.post('/api/todo/attachments', {
            todoId: IDS.todo.apolloOpen,
            name: 'one-too-many.png',
            data: FIXTURE_PNG,
        });

        expect(res.status).toBe(400);
        expect(message(res.data)).toContain('Attachment limit');
    });

    it('под потолком вложение добавляется', async () => {
        // У задачи одно вложение из фикстур — второе должно пройти.
        const owner = await signedInAs(FIXTURE_EMAILS.acmeOwner);
        const res = await owner.post('/api/todo/attachments', {
            todoId: IDS.todo.apolloOpen,
            name: 'ok.png',
            data: FIXTURE_PNG,
        });

        expect(res.status).toBe(201);
    });

    it('вложение чужой компании не отдаётся — 404', async () => {
        // apolloShot принадлежит ACME; владелец Rival не должен его достать.
        const rival = await signedInAs(FIXTURE_EMAILS.rivalOwner);
        const res = await rival.get(`/api/todo/attachments/${IDS.attachment.apolloShot}`);

        expect(res.status).toBe(404);
    });
});

describe('Изоляция категорий материалов по компании (P0)', () => {
    it('список категорий отдаёт только свою компанию', async () => {
        const acme = await signedInAs(FIXTURE_EMAILS.acmeOwner);
        const res = await acme.get<Array<{ id: string }>>('/api/materials/categories');

        expect(res.status).toBe(200);
        const ids = res.data.map((c) => c.id);

        expect(ids).toContain(IDS.category.acmeDocs);
        expect(ids).not.toContain(IDS.category.rivalDocs);
    });

    it('у чужой компании — свой набор, без пересечения', async () => {
        const rival = await signedInAs(FIXTURE_EMAILS.rivalOwner);
        const res = await rival.get<Array<{ id: string }>>('/api/materials/categories');

        const ids = res.data.map((c) => c.id);

        expect(ids).toContain(IDS.category.rivalDocs);
        expect(ids).not.toContain(IDS.category.acmeDocs);
    });

    it('материал с чужой категорией не создаётся — 404', async () => {
        const acme = await signedInAs(FIXTURE_EMAILS.acmeOwner);
        const res = await acme.post('/api/materials', {
            name: 'Sneaky',
            sourceLink: 'https://acme.test/x',
            categoryId: IDS.category.rivalDocs,
        });

        expect(res.status).toBe(404);
    });
});

describe('Лимит проектов по тарифу', () => {
    it('на FREE (3 проекта) четвёртый отбивается 400', async () => {
        // Solo — FREE, 0 проектов в фикстурах: создаём три, четвёртый упирается в лимит.
        const owner = await signedInAs(FIXTURE_EMAILS.soloOwner);

        for (let i = 1; i <= 3; i++) {
            const ok = await owner.post('/api/projects', { name: `Project ${i}` });

            expect(ok.status).toBe(201);
        }

        const overflow = await owner.post('/api/projects', { name: 'Project 4' });

        expect(overflow.status).toBe(400);
        expect(message(overflow.data)).toContain('Project limit');
    });

    it('чужой проект по id недоступен — 404', async () => {
        const acme = await signedInAs(FIXTURE_EMAILS.acmeOwner);
        const res = await acme.get(`/api/projects/${IDS.project.rivalProject}`);

        expect(res.status).toBe(404);
    });
});
