import { dbClient } from '~~/lib/dbClient';
import { ECompanyPlan, COMPANY_PLANS, type ICompanyPlanLimits, type ICompanyPlanState } from '#shared/types/company';
import { formatBytes } from '#shared/utils/format';

/**
 * План из БД хранится строкой — приводим к enum'у. Незнакомое значение (правка руками,
 * откат схемы) не должно ронять запрос, поэтому падаем на самый строгий план.
 */
export function toPlan(raw: string | null | undefined): ECompanyPlan {
    return Object.values(ECompanyPlan).includes(raw as ECompanyPlan) ? (raw as ECompanyPlan) : ECompanyPlan.FREE;
}

export function planLimits(raw: string | null | undefined): ICompanyPlanLimits {
    return COMPANY_PLANS[toPlan(raw)];
}

/**
 * Текущее использование: места считаем count'ом по companyId, место — суммой размеров
 * вложений. Оба запроса по индексированным полям; денормализованных счётчиков нет
 * намеренно — задачи и проекты удаляются каскадом, и счётчик было бы нечем декрементить.
 */
export async function getCompanyPlanState(companyId: string): Promise<ICompanyPlanState> {
    const [company, seats, projects, storage] = await Promise.all([
        dbClient.company.findUnique({ where: { id: companyId }, select: { plan: true } }),
        dbClient.user.count({ where: { companyId } }),
        dbClient.project.count({ where: { companyId } }),
        dbClient.todoAttachment.aggregate({ _sum: { size: true }, where: { companyId } }),
    ]);

    const plan = toPlan(company?.plan);

    return {
        plan,
        limits: COMPANY_PLANS[plan],
        usage: { seats, projects, storageBytes: storage._sum.size || 0 },
    };
}

/** Бросает 400, если новый файл не влезает в квоту тарифа. */
export async function assertStorageQuota(companyId: string, addedBytes: number) {
    const { limits, usage } = await getCompanyPlanState(companyId);

    if (usage.storageBytes + addedBytes <= limits.storageBytes) return;

    throw createError({
        statusCode: 400,
        message: `Storage limit reached: ${formatBytes(limits.storageBytes)} on the ${limits.label} plan. Used ${formatBytes(usage.storageBytes)}, this file needs ${formatBytes(addedBytes)}. Free up space or upgrade the plan.`,
    });
}

/** Бросает 400, если в компании исчерпан лимит проектов по тарифу. */
export async function assertProjectAvailable(companyId: string) {
    const { limits, usage } = await getCompanyPlanState(companyId);

    if (usage.projects < limits.projects) return;

    throw createError({
        statusCode: 400,
        message: `Project limit reached: the ${limits.label} plan allows ${limits.projects} projects. Upgrade the plan to create more.`,
    });
}

/** Бросает 400, если в компании не осталось свободных мест по тарифу. */
export async function assertSeatAvailable(companyId: string) {
    const { limits, usage } = await getCompanyPlanState(companyId);

    if (usage.seats < limits.seats) return;

    throw createError({
        statusCode: 400,
        message: `No seats left: the ${limits.label} plan allows ${limits.seats} ${limits.seats === 1 ? 'member' : 'members'}. Upgrade the plan to invite more people.`,
    });
}
