import { headConfig } from './config/head.config';

interface IEnv {
    SITE_URL: string;
    DEV: boolean;
}

const env: IEnv = {
    SITE_URL: process.env.SITE_URL || 'http://localhost:3000',
    DEV: process.env.NODE_ENV === 'development',
};

/**
 * Креды демо-пользователя. Лежат в публичном конфиге осознанно: вход по `?mode=demo`
 * делает браузер обычным запросом на /api/auth/login, иначе кука сессии не дойдёт до него.
 * Пара наружу открыта — под ней должен быть заведён пользователь с ролью TEST, которому
 * сервер запрещает любую запись.
 */
const demo = {
    email: process.env.NUXT_PUBLIC_DEMO_EMAIL || '',
    password: process.env.NUXT_PUBLIC_DEMO_PASSWORD || '',
};

const breakpoints = {
    mobile: 767,
    tablet: 1279,
    laptop: 1439,
    desktop: 1920,
};

export default defineNuxtConfig({
    modules: [
        '@nuxt/ui',
        'nuxt-csurf',
        '@pinia/nuxt',
        '@vueuse/nuxt',
        'nuxt-security',
        'nuxt-auth-utils',
        '@nuxt/image',
        '@nuxtjs/sitemap',
        '@nuxtjs/robots',
        '@nuxt/eslint',
    ],

    components: [
        {
            path: '~/components',
            pathPrefix: false,
            global: true,
        },
    ],

    devtools: {
        enabled: env.DEV,
    },

    app: {
        head: headConfig,
    },

    css: ['~/assets/css/main.css'],

    // SEO
    site: {
        url: env.SITE_URL,
    },

    // Env
    runtimeConfig: {
        ...env,

        public: {
            demo,
        },
    },

    // Route rules
    routeRules: {
        '/api/auth/**': {
            security: {
                rateLimiter: {
                    tokensPerInterval: 10,
                    interval: 60000,
                },
            },
        },
    },
    compatibilityDate: '2025-07-15',

    vite: {
        optimizeDeps: {
            include: [
                '@nuxt/ui > prosemirror-state',
                '@nuxt/ui > prosemirror-transform',
                '@nuxt/ui > prosemirror-model',
                '@nuxt/ui > prosemirror-view',
                '@nuxt/ui > prosemirror-gapcursor',
            ],
        },
    },

    /*
     * Аналог @prisma/nextjs-monorepo-workaround-plugin, которого для Nitro не существует.
     *
     * Движок Prisma (libquery_engine-*.node) — бинарник, который грузится по пути в
     * рантайме, а не через import, поэтому его не видит ни один сборщик и в бандл он не
     * попадает. При этом в бандл запекается абсолютный путь каталога генерации с машины
     * сборки: на Vercel это `/vercel/path0/prisma/generated/prisma`, а исполняется код уже
     * в `/var/task`. Итог — все запросы в базу падают, снаружи это выглядит как сломанный вход.
     *
     * Слушателя вешаем через `nitro:init`, а НЕ через `nitro: { hooks: { compiled } }`:
     * второй вариант замещает одноимённый хук пресета Vercel, тот перестаёт писать
     * config.json и .vc-config.json, и деплой падает с «No Output Directory named "dist"».
     *
     * Путь до скопированного файла на старте проставляет server/plugins/prisma-engine.ts —
     * без него Prisma движок рядом с бандлом не находит.
     */
    hooks: {
        'nitro:init'(nitro) {
            nitro.hooks.hook('compiled', async () => {
                const { copyFile, readdir } = await import('node:fs/promises');
                const { join } = await import('node:path');

                // Должен совпадать с `output` в prisma/schema.prisma.
                const from = join(nitro.options.rootDir, 'prisma/generated/prisma');
                const to = nitro.options.output.serverDir;

                const engines = (await readdir(from).catch(() => [] as string[])).filter(
                    (file) => file.startsWith('libquery_engine') && file.endsWith('.node')
                );

                for (const file of engines) {
                    await copyFile(join(from, file), join(to, file));
                }

                if (!engines.length) {
                    console.warn(`[nitro] движок Prisma не найден в ${from} — прод-сборка не сможет ходить в базу`);
                }
            });
        },
    },

    // Security
    csurf: {
        https: !env.DEV,
        cookie: {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
        },
        methodsToProtect: ['POST', 'PUT', 'PATCH'],
        addCsrfTokenToEventCtx: true,
        headerName: 'csrf-token',
    },

    eslint: {
        config: {
            stylistic: env.DEV,
        },
    },

    // @nuxt/icon
    icon: {
        localApiEndpoint: '/icons-api/_nuxt_icon',
        mode: 'svg',
        customCollections: [
            {
                prefix: 'local',
                dir: './app/assets/icons',
            },
        ],
    },

    // Nuxt images module
    image: {
        quality: 80,
        domains: [env.SITE_URL],
        screens: { ...breakpoints },
        format: ['webp'],
    },
});
