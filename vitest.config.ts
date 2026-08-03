import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const root = fileURLToPath(new URL('./', import.meta.url));

// Псевдонимы как в Nuxt. Порядок важен: `~~/` должен разбираться до `~/`,
// иначе второй съест префикс первого.
const alias = [
    { find: /^~~\//, replacement: root },
    { find: /^#shared\//, replacement: `${root}shared/` },
    { find: /^~\//, replacement: `${root}app/` },
];

export default defineConfig({
    test: {
        projects: [
            {
                // Юниты: чистая логика на моках, без БД и без сервера — идут в pre-commit.
                resolve: { alias },
                test: {
                    name: 'unit',
                    environment: 'node',
                    include: ['test/unit/**/*.spec.ts'],
                    setupFiles: ['test/setup.ts'],
                },
            },
            {
                // Интеграционные: поднимают настоящий Nuxt против тестовой базы.
                resolve: { alias },
                test: {
                    name: 'api',
                    environment: 'node',
                    include: ['test/api/**/*.spec.ts'],
                    // Один сервер и общая база — параллельные файлы затирали бы данные друг друга.
                    fileParallelism: false,
                    // Тестовая БД — удалённый Atlas: отдельные операции идут секундами.
                    testTimeout: 60_000,
                    hookTimeout: 120_000,
                },
            },
        ],
    },
});
