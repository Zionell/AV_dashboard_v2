import { headConfig } from './config/head.config';

interface IEnv {
    SITE_URL: string;
    DEV: boolean;
}

const env: IEnv = {
    SITE_URL: process.env.SITE_URL || 'http://localhost:3000',
    DEV: process.env.NODE_ENV === 'development',
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

    // Security
    csurf: {
        // CSRF выключаем только в интеграционных тестах: тест-клиент не воспроизводит
        // парную куку/заголовок. Тесты идут против dev-сервера (nuxi _dev жёстко ставит
        // NODE_ENV=development), поэтому ориентируемся на явный флаг из харнесса, а не на
        // NODE_ENV. Флаг ставит только тестовый харнесс — в проде его нет.
        enabled: !(process.env.NODE_ENV === 'test' || process.env.NUXT_DISABLE_CSRF === 'true'),
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

    // @nuxt/eslint — генерирует .nuxt/eslint.config.mjs; stylistic включает @stylistic-правила из eslint.config.mjs
    eslint: {
        config: {
            stylistic: true,
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
