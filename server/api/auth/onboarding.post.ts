import { z } from 'zod';
import { dbClient } from '~~/lib/dbClient';
import { EUserRole } from '#shared/types/user';
import { ECompanyPlan } from '#shared/types/company';

const bodySchema = z.object({
    name: z.string().trim().min(1, 'Name is required'),
    companyName: z.string().trim().min(1, 'Company name is required'),
    phone: z.string().trim().optional(),
    // Тариф выбирается при создании компании; без явного выбора — самый строгий.
    plan: z.enum(ECompanyPlan).default(ECompanyPlan.FREE),
});

export default defineEventHandler(async (event) => {
    const { user: sessionUser } = await requireUserSession(event);
    const body = await readValidatedBody(event, bodySchema.parse);

    const current = await dbClient.user.findUnique({
        where: { id: sessionUser.id },
    });

    if (!current) throw createError({ statusCode: 401, message: 'Unauthorized' });
    if (current.companyId) {
        throw createError({ statusCode: 400, message: 'Onboarding is already complete' });
    }

    const company = await dbClient.company.create({
        data: { name: body.companyName, plan: body.plan },
    });

    const updated = await dbClient.user.update({
        where: { id: current.id },
        data: {
            name: body.name,
            phone: body.phone || null,
            companyId: company.id,
            role: EUserRole.OWNER,
        },
    });

    await replaceUserSession(event, {
        user: {
            id: updated.id,
            email: updated.email,
            role: updated.role,
        },
    });

    const { hash: _, ...user } = updated;

    return user;
});
