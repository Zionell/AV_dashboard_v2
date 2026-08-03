/**
 * Пересев тестовой базы: чистит и заливает фикстуры заново.
 * Запускается перед интеграционными тестами и при старте превью-режима —
 * поэтому каждый запуск начинается с одинакового состояния.
 *
 *   npm run db:seed-test
 */
import { readFileSync } from 'node:fs';
import { createTestPrisma } from '../test/fixtures/client.ts';
import { resetDatabase } from '../test/fixtures/seed.ts';

// .env.test не подхватывается автоматически — читаем сами, без лишних зависимостей.
function loadTestEnv() {
    if (process.env.TEST_DATABASE_URL) return;

    try {
        const raw = readFileSync(new URL('../.env.test', import.meta.url), 'utf8');
        const match = raw.match(/^DATABASE_URL=["']?(.+?)["']?$/m);

        if (match) process.env.TEST_DATABASE_URL = match[1];
    } catch {
        throw new Error('Не найден .env.test — скопируйте .env и замените имя базы на av_dashboard_test');
    }
}

loadTestEnv();

const db = createTestPrisma();

try {
    await resetDatabase(db);

    const counts = {
        компаний: await db.company.count(),
        пользователей: await db.user.count(),
        проектов: await db.project.count(),
        задач: await db.todo.count(),
        категорий: await db.materialCategory.count(),
        материалов: await db.material.count(),
        вложений: await db.todoAttachment.count(),
        приглашений: await db.invitation.count(),
    };

    console.log('Тестовая база пересеяна:', JSON.stringify(counts));
} finally {
    await db.$disconnect();
}
