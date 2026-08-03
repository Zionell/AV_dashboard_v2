import { EUserRole } from '#shared/types/user';
import type { ICompanyPlanState } from '#shared/types/company';

// Тариф компании и текущее использование. Гейт как у stats — данные административные.
export default defineEventHandler(async (event): Promise<ICompanyPlanState> => {
    try {
        requireRole(event, EUserRole.OWNER, EUserRole.MANAGER);
        const companyId = requireCompanyId(event);

        return await getCompanyPlanState(companyId);
    } catch (e) {
        logger.warn('Company plan/ get: ', e);
        throw e;
    }
});
