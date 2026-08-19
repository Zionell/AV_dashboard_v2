import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Prisma грузит libquery_engine по абсолютному пути каталога генерации — тому, что был на
 * машине сборки. В деплой уезжает только бандл, и пути не совпадают: на Vercel собирается
 * в `/vercel/path0/prisma/generated/prisma`, а исполняется в `/var/task`. Любой запрос в базу
 * падает с PrismaClientInitializationError.
 *
 * Снаружи это выглядит как «сайт открылся, а вход не работает»: `/api/users/me` отдаёт 401
 * ещё до обращения к базе, поэтому оболочка рисуется, а падает первое же действие с базой.
 *
 * Файл движка кладёт рядом с серверным бандлом хук `nitro.hooks.compiled` в nuxt.config,
 * а здесь мы находим его и сообщаем Prisma явно — одного наличия файла недостаточно.
 */
const ENGINE_FILE = /^libquery_engine-.*\.node$/;

/**
 * Каталоги, где может лежать движок. На `import.meta.url` полагаться нельзя: Nitro
 * подменяет его на `globalThis._importMeta_.url`, и на момент запуска плагина там ещё
 * заглушка `file:///_entry.js` — dirname от неё даёт корень файловой системы.
 * Поэтому основной ориентир — рабочий каталог процесса: в лямбде это и есть корень бандла.
 */
function candidateDirs(): string[] {
    const cwd = process.cwd();
    const here = dirname(fileURLToPath(import.meta.url));

    return [
        cwd, // Vercel: /var/task — туда попадает содержимое .output/server
        join(cwd, '.output', 'server'), // локальный запуск `node .output/server/index.mjs`
        here,
        join(here, '..'),
        join(here, '..', '..'),
    ];
}

function findEngine(): string | null {
    for (const dir of candidateDirs()) {
        try {
            const hit = readdirSync(dir).find((file) => ENGINE_FILE.test(file));

            if (hit) return join(dir, hit);
        } catch {
            // Каталога может не быть — пробуем следующий.
        }
    }

    return null;
}

export default defineNitroPlugin(() => {
    // Явно заданная переменная окружения главнее наших догадок.
    if (process.env.PRISMA_QUERY_ENGINE_LIBRARY) return;

    const engine = findEngine();

    if (engine) {
        process.env.PRISMA_QUERY_ENGINE_LIBRARY = engine;

        return;
    }

    // В dev движок резолвится штатно из prisma/generated, поэтому молчим.
    if (!import.meta.dev) {
        console.warn('[prisma-engine] libquery_engine не найден рядом с бандлом — запросы в базу упадут');
    }
});
