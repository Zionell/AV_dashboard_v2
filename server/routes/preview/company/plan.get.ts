import { COMPANY_PLANS, ECompanyPlan } from '#shared/types/company';
import { previewDb } from '~~/server/utils/preview/store';

export function previewPlanState() {
    const db = previewDb();
    const plan = Object.values(ECompanyPlan).includes(db.company.plan as ECompanyPlan)
        ? (db.company.plan as ECompanyPlan)
        : ECompanyPlan.FREE;

    return {
        plan,
        limits: COMPANY_PLANS[plan],
        usage: {
            seats: db.users.length,
            projects: db.projects.length,
            storageBytes: db.attachments.reduce((sum, a) => sum + Math.floor((a.data.length * 3) / 4), 0),
        },
    };
}

// Копия GET /api/company/plan
export default defineEventHandler(() => previewPlanState());
