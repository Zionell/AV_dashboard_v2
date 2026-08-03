import { previewDb } from '~~/server/utils/preview/store';
import { previewPlanState } from './plan.get';

// Копия PATCH /api/company/plan: смена тарифа в памяти.
export default defineEventHandler(async (event) => {
    const db = previewDb();
    const body = await readBody(event);

    if (body.plan) db.company.plan = body.plan;

    return previewPlanState();
});
