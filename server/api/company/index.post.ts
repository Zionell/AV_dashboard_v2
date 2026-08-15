import { z } from 'zod';
import { prisma } from '~~/server/utils/prisma';
import { EUserRole } from '#shared/types/user';

const bodySchema = z.object({
    name: z.string().trim().min(1, 'Company name is required'),
});

export default defineEventHandler(async (event) => {
    try {
        const user = requireApiUser(event);
        const body = await readValidatedBody(event, bodySchema.parse);

        if (user.companyId) {
            throw createError({ statusCode: 400, message: 'Company already exists' });
        }

        const company = await prisma.company.create({
            data: { name: body.name },
        });

        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                role: EUserRole.OWNER,
                companyId: company.id,
            },
        });

        setResponseStatus(event, 201);
    } catch (e) {
        logger.warn('Company/ post: ', e);
        throw e;
    }
});
