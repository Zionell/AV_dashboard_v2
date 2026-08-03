import { z } from 'zod';
import { dbClient } from '~~/lib/dbClient';
import { EUserRole } from '#shared/types/user';
import { COMPANY_PLANS, ECompanyPlan, type ICompanyPlanState } from '#shared/types/company';
import { formatBytes } from '#shared/utils/format';

const bodySchema = z.object({
    plan: z.enum(ECompanyPlan),
});

// Смена тарифа — только owner: это платёжное решение, а не операционное.
export default defineEventHandler(async (event): Promise<ICompanyPlanState> => {
    try {
        requireRole(event, EUserRole.OWNER);
        const companyId = requireCompanyId(event);
        const { plan } = await readValidatedBody(event, bodySchema.parse);

        const { usage } = await getCompanyPlanState(companyId);
        const next = COMPANY_PLANS[plan];

        // Понижение тарифа не должно оставлять компанию за пределами собственных лимитов:
        // иначе получим участников, которых некуда деть, и хранилище, которое не почистить.
        if (usage.seats > next.seats) {
            throw createError({
                statusCode: 400,
                message: `The ${next.label} plan allows ${next.seats} ${next.seats === 1 ? 'member' : 'members'}, but the company has ${usage.seats}. Remove members first.`,
            });
        }

        if (usage.projects > next.projects) {
            throw createError({
                statusCode: 400,
                message: `The ${next.label} plan allows ${next.projects} projects, but the company has ${usage.projects}. Delete projects first.`,
            });
        }

        if (usage.storageBytes > next.storageBytes) {
            throw createError({
                statusCode: 400,
                message: `The ${next.label} plan allows ${formatBytes(next.storageBytes)}, but ${formatBytes(usage.storageBytes)} is in use. Free up space first.`,
            });
        }

        await dbClient.company.update({ where: { id: companyId }, data: { plan } });

        return await getCompanyPlanState(companyId);
    } catch (e) {
        logger.warn('Company plan/ patch: ', e);
        throw e;
    }
});
