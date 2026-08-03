import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { setup } from '@nuxt/test-utils/e2e';
import { fileURLToPath } from 'node:url';
import { ApiClient, signedInAs, resetFixtures, testDb, useTestDatabaseEnv } from './harness.ts';
import { FIXTURE_EMAILS, FIXTURE_TOKENS, IDS } from '../fixtures/ids.ts';

useTestDatabaseEnv();

await setup({
    rootDir: fileURLToPath(new URL('../..', import.meta.url)),
    server: true,
    browser: false,
    // Гоняем против dev-сервера, а не прод-сборки: в проде Prisma-клиент (CJS,
    // ищет движок через __dirname) инлайнится в ESM-бандл Nitro и падает на старте.
    // Dev держит Prisma внешним модулем, как и рабочий dev-сервер. Прод-сборку
    // чиним отдельно (см. docs/audit.md).
    dev: true,
});

beforeAll(async () => {
    await resetFixtures();
});

beforeEach(async () => {
    await resetFixtures();
});

describe('POST /api/company/invite', () => {
    it('владелец приглашает: создаётся запись с заданной нормой часов', async () => {
        const owner = await signedInAs(FIXTURE_EMAILS.acmeOwner);

        const res = await owner.post('/api/company/invite', { email: 'newbie@acme.test', workHours: 5 });

        expect(res.status).toBe(200);

        const db = testDb();
        const invite = await db.invitation.findFirst({ where: { email: 'newbie@acme.test' } });

        await db.$disconnect();

        expect(invite).toMatchObject({ companyId: IDS.company.acme, workHours: 5, acceptedAt: null });
        expect(invite?.token).toHaveLength(64);
        expect(invite?.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('менеджеру приглашать нельзя', async () => {
        const manager = await signedInAs(FIXTURE_EMAILS.acmeManager);

        const res = await manager.post('/api/company/invite', { email: 'x@acme.test', workHours: 8 });

        expect(res.status).toBe(403);
    });

    it('нет свободных мест — приглашение не уходит', async () => {
        // Solo на тарифе FREE: одно место, занято владельцем.
        const soloOwner = await signedInAs(FIXTURE_EMAILS.soloOwner);

        const res = await soloOwner.post('/api/company/invite', { email: 'x@solo.test', workHours: 8 });

        expect(res.status).toBe(400);
        expect(String((res.data as { message?: string }).message)).toContain('No seats left');
    });

    it('повторное приглашение гасит прошлое непринятое', async () => {
        const owner = await signedInAs(FIXTURE_EMAILS.acmeOwner);

        await owner.post('/api/company/invite', { email: FIXTURE_EMAILS.nomad, workHours: 3 });

        const db = testDb();
        // На Mongo непринятые = acceptedAt не выставлен; `null` его не матчит (см. invite.post.ts).
        const live = await db.invitation.findMany({
            where: { email: FIXTURE_EMAILS.nomad, OR: [{ acceptedAt: null }, { acceptedAt: { isSet: false } }] },
        });

        await db.$disconnect();

        // Иначе по старой ссылке человек вошёл бы с неактуальной нормой часов.
        expect(live).toHaveLength(1);
        expect(live[0]?.workHours).toBe(3);
    });

    it('невалидная норма часов отбивается', async () => {
        const owner = await signedInAs(FIXTURE_EMAILS.acmeOwner);

        expect((await owner.post('/api/company/invite', { email: 'a@acme.test', workHours: 0 })).status).toBe(400);
        expect((await owner.post('/api/company/invite', { email: 'a@acme.test', workHours: 25 })).status).toBe(400);
    });
});

describe('POST /api/auth/accept-invite', () => {
    it('принятие привязывает к компании и переносит норму часов', async () => {
        const nomad = await signedInAs(FIXTURE_EMAILS.nomad);

        const res = await nomad.post('/api/auth/accept-invite', { token: FIXTURE_TOKENS.pending });

        expect(res.status).toBe(200);

        const db = testDb();
        const user = await db.user.findUnique({ where: { id: IDS.user.nomad } });
        const invite = await db.invitation.findUnique({ where: { id: IDS.invitation.pending } });

        await db.$disconnect();

        expect(user).toMatchObject({
            companyId: IDS.company.acme,
            // Норма из приглашения, а не дефолтные 8.
            workHours: 4,
            role: 'EMPLOYEE',
        });
        expect(invite?.acceptedAt).toBeTruthy();
    });

    it.each([
        ['просроченное', FIXTURE_TOKENS.expired],
        ['уже принятое', FIXTURE_TOKENS.accepted],
        ['несуществующее', 'no-such-token'],
    ])('%s приглашение отбивается одинаковым текстом', async (_case, token) => {
        const nomad = await signedInAs(FIXTURE_EMAILS.nomad);

        const res = await nomad.post('/api/auth/accept-invite', { token });

        expect(res.status).toBe(400);
        // Формулировка общая, чтобы не раскрывать существование токена.
        expect(String((res.data as { message?: string }).message)).toContain('no longer valid');
    });

    it('чужая почта — отказ, даже если токен настоящий', async () => {
        // Ссылку могли переслать: без сверки почты в компанию зашёл бы кто угодно.
        const stranger = new ApiClient();

        await stranger.login(FIXTURE_EMAILS.rivalOwner);

        const res = await stranger.post('/api/auth/accept-invite', { token: FIXTURE_TOKENS.pending });

        expect(res.status).toBe(400);
    });

    it('у кого уже есть компания — отказ', async () => {
        const owner = await signedInAs(FIXTURE_EMAILS.acmeOwner);

        const res = await owner.post('/api/auth/accept-invite', { token: FIXTURE_TOKENS.pending });

        expect(res.status).toBe(400);
        expect(String((res.data as { message?: string }).message)).toContain('already belong');
    });

    it('без авторизации — 401', async () => {
        const anon = new ApiClient();

        const res = await anon.post('/api/auth/accept-invite', { token: FIXTURE_TOKENS.pending });

        expect(res.status).toBe(401);
    });
});
