import { headConfig } from './config/head.config';

interface IEnv {
    SITE_URL: string;
    JWT_SALT: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    GOOGLE_REDIRECT_URI: string;
    DEV: boolean;
}

const env: IEnv = {
    SITE_URL: process.env.SITE_URL || 'http://localhost:3000',
    JWT_SALT: process.env.JWT_SALT || '',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || '',
    DEV: process.env.NODE_ENV === 'development',
};

const breakpoints = {
    mobile: 767,
    tablet: 1279,
    laptop: 1439,
    desktop: 1920,
};

export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',

    devtools: {
        enabled: env.DEV,
    },

    modules: [
        '@nuxt/ui',
        'nuxt-csurf',
        '@pinia/nuxt',
        '@vueuse/nuxt',
        'nuxt-security',
        '@nuxt/image',
        '@nuxtjs/sitemap',
        '@nuxtjs/robots',
    ],

    components: [
        {
            path: '~/components',
            pathPrefix: false,
            global: true,
        },
    ],

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

    // Env
    runtimeConfig: {
        ...env,
    },

    // Route rules
    routeRules: env.DEV
        ? {}
        : {
              // Cached for 10 min
              '/api/*': { cache: { maxAge: 60 * 10 } },
          },

    // Nuxt images module
    image: {
        quality: 80,
        domains: [env.SITE_URL],
        screens: { ...breakpoints },
        format: ['webp'],
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

    security: {
        // options
    },

    // SEO
    site: {
        url: env.SITE_URL,
    },

    css: ['~/assets/css/main.css'],

    app: {
        // @ts-expect-error
        head: headConfig,
    },
});
