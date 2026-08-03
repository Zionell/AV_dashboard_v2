import { dbClient } from '~~/lib/dbClient';

// Справочник категорий своей компании. Без скоупа эндпоинт отдавал категории всех компаний.
export default defineEventHandler(async (event) => {
    try {
        requireApiUser(event);
        const companyId = requireCompanyId(event);

        const { search }: { search?: string } = getQuery(event);

        const categories = await dbClient.materialCategory.findMany({
            where: {
                companyId,
                // Поиск без учёта регистра — как в остальных списках.
                ...(search ? { label: { contains: search, mode: 'insensitive' as const } } : {}),
            },
        });

        return categories || [];
    } catch (e) {
        logger.warn('MaterialCategory/ get: ', e);
        throw e;
    }
});
