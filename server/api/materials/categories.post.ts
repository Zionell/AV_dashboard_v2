import { z } from 'zod';
import { dbClient } from '~~/lib/dbClient';
import { EUserRole } from '#shared/types/user';

const bodySchema = z.object({
    label: z.string().trim().min(1, 'Name is required'),
    color: z.string().trim().min(1, 'Color is required'),
});

export default defineEventHandler(async (event) => {
    try {
        requireRole(event, EUserRole.OWNER, EUserRole.MANAGER);
        const companyId = requireCompanyId(event);
        const body = await readValidatedBody(event, bodySchema.parse);

        return await dbClient.materialCategory.create({
            data: { ...body, companyId },
        });
    } catch (e) {
        logger.warn('MaterialCategory/ post: ', e);
        throw e;
    }
});
