import { PrismaClient } from '../../prisma/generated/prisma/index.js';

/**
 * Prisma-клиент для тестовой базы. Отдельный от рабочего `lib/dbClient`, чтобы
 * ни тесты, ни пересев превью физически не могли попасть в боевые данные:
 * строка подключения берётся только из TEST_DATABASE_URL.
 */
export function createTestPrisma(): PrismaClient {
    const url = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

    if (!url) {
        throw new Error('TEST_DATABASE_URL не задан — нечего чистить и засеивать');
    }

    // Страховка от катастрофы: имя базы обязано выдавать тестовую.
    const dbName = new URL(url).pathname.slice(1);

    if (!/test/i.test(dbName)) {
        throw new Error(`Отказ: база «${dbName}» не похожа на тестовую. Ожидалось имя с «test».`);
    }

    return new PrismaClient({ datasources: { db: { url } } });
}
