import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ECompanyPlan, COMPANY_PLANS } from '#shared/types/company';

vi.mock('~~/server/utils/prisma', () => ({
    prisma: {
        company: { findUnique: vi.fn() },
        user: { count: vi.fn() },
        project: { count: vi.fn() },
        todoAttachment: { aggregate: vi.fn() },
    },
}));

const { prisma } = await import('~~/server/utils/prisma');
const { toPlan, planLimits, getCompanyPlanState, assertStorageQuota, assertSeatAvailable, assertProjectAvailable } =
    await import('~~/server/utils/plan');

const db = prisma as unknown as {
    company: { findUnique: ReturnType<typeof vi.fn> };
    user: { count: ReturnType<typeof vi.fn> };
    project: { count: ReturnType<typeof vi.fn> };
    todoAttachment: { aggregate: ReturnType<typeof vi.fn> };
};

/** Подставляет состояние компании, чтобы не расписывать все четыре мока в каждом тесте. */
function givenCompany({ plan = ECompanyPlan.FREE, seats = 0, projects = 0, storageBytes = 0 } = {}) {
    db.company.findUnique.mockResolvedValue({ plan });
    db.user.count.mockResolvedValue(seats);
    db.project.count.mockResolvedValue(projects);
    db.todoAttachment.aggregate.mockResolvedValue({ _sum: { size: storageBytes } });
}

/** Ожидает, что промис упадёт ошибкой с нужным HTTP-кодом. */
async function expectStatus(promise: Promise<unknown>, statusCode: number) {
    await expect(promise).rejects.toMatchObject({ statusCode });
}

beforeEach(() => {
    vi.clearAllMocks();
});

describe('toPlan', () => {
    it('принимает известные значения', () => {
        expect(toPlan('FREE')).toBe(ECompanyPlan.FREE);
        expect(toPlan('PRO')).toBe(ECompanyPlan.PRO);
        expect(toPlan('TEAM')).toBe(ECompanyPlan.TEAM);
    });

    it('падает на самый строгий план при мусоре в БД', () => {
        // Правка руками, откат схемы, опечатка — не должны открывать доступ шире.
        expect(toPlan('ENTERPRISE')).toBe(ECompanyPlan.FREE);
        expect(toPlan('')).toBe(ECompanyPlan.FREE);
        expect(toPlan(null)).toBe(ECompanyPlan.FREE);
        expect(toPlan(undefined)).toBe(ECompanyPlan.FREE);
    });
});

describe('лимиты тарифов', () => {
    const GB = 1024 ** 3;

    // Значения из договорённости: free 1/3/1GB, pro 5/5/3GB, team 20/10/10GB.
    it.each([
        [ECompanyPlan.FREE, 1, 3, GB],
        [ECompanyPlan.PRO, 5, 5, 3 * GB],
        [ECompanyPlan.TEAM, 20, 10, 10 * GB],
    ])('%s: %i мест, %i проектов, %i байт', (plan, seats, projects, storageBytes) => {
        expect(COMPANY_PLANS[plan]).toMatchObject({ seats, projects, storageBytes });
    });

    it('planLimits отдаёт лимиты строкового плана', () => {
        expect(planLimits('TEAM').seats).toBe(20);
        expect(planLimits('невалидный').seats).toBe(COMPANY_PLANS[ECompanyPlan.FREE].seats);
    });
});

describe('getCompanyPlanState', () => {
    it('собирает план, лимиты и использование', async () => {
        givenCompany({ plan: ECompanyPlan.PRO, seats: 3, projects: 2, storageBytes: 1234 });

        const state = await getCompanyPlanState('c1');

        expect(state.plan).toBe(ECompanyPlan.PRO);
        expect(state.limits).toEqual(COMPANY_PLANS[ECompanyPlan.PRO]);
        expect(state.usage).toEqual({ seats: 3, projects: 2, storageBytes: 1234 });
    });

    it('пустое хранилище даёт 0, а не null', async () => {
        // aggregate по пустой выборке возвращает _sum.size === null.
        givenCompany({ storageBytes: null as unknown as number });

        const state = await getCompanyPlanState('c1');

        expect(state.usage.storageBytes).toBe(0);
    });
});

describe('assertStorageQuota', () => {
    it('пропускает, когда файл влезает', async () => {
        givenCompany({ plan: ECompanyPlan.FREE, storageBytes: 1000 });

        await expect(assertStorageQuota('c1', 500)).resolves.toBeUndefined();
    });

    it('пропускает при попадании ровно в лимит', async () => {
        const limit = COMPANY_PLANS[ECompanyPlan.FREE].storageBytes;

        givenCompany({ plan: ECompanyPlan.FREE, storageBytes: limit - 100 });

        await expect(assertStorageQuota('c1', 100)).resolves.toBeUndefined();
    });

    it('отбивает превышение на один байт', async () => {
        const limit = COMPANY_PLANS[ECompanyPlan.FREE].storageBytes;

        givenCompany({ plan: ECompanyPlan.FREE, storageBytes: limit - 100 });

        await expectStatus(assertStorageQuota('c1', 101), 400);
    });

    it('в тексте ошибки есть название тарифа и объёмы', async () => {
        givenCompany({ plan: ECompanyPlan.PRO, storageBytes: COMPANY_PLANS[ECompanyPlan.PRO].storageBytes });

        await expect(assertStorageQuota('c1', 1)).rejects.toMatchObject({
            message: expect.stringContaining('Pro'),
        });
    });
});

describe('assertSeatAvailable', () => {
    it('пропускает, пока есть свободные места', async () => {
        givenCompany({ plan: ECompanyPlan.PRO, seats: 4 });

        await expect(assertSeatAvailable('c1')).resolves.toBeUndefined();
    });

    it('отбивает, когда места кончились', async () => {
        givenCompany({ plan: ECompanyPlan.PRO, seats: 5 });

        await expectStatus(assertSeatAvailable('c1'), 400);
    });

    it('на FREE единственное место занято владельцем', async () => {
        givenCompany({ plan: ECompanyPlan.FREE, seats: 1 });

        await expect(assertSeatAvailable('c1')).rejects.toMatchObject({
            // Единственное число, а не «1 members».
            message: expect.stringContaining('1 member'),
        });
    });
});

describe('assertProjectAvailable', () => {
    it('пропускает до достижения лимита', async () => {
        givenCompany({ plan: ECompanyPlan.FREE, projects: 2 });

        await expect(assertProjectAvailable('c1')).resolves.toBeUndefined();
    });

    it('отбивает на лимите', async () => {
        givenCompany({ plan: ECompanyPlan.FREE, projects: 3 });

        await expectStatus(assertProjectAvailable('c1'), 400);
    });

    it('на TEAM лимит выше', async () => {
        givenCompany({ plan: ECompanyPlan.TEAM, projects: 9 });

        await expect(assertProjectAvailable('c1')).resolves.toBeUndefined();
    });
});
