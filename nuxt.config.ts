import {defineNuxtConfig} from 'nuxt/config';
import headConfig from './config/head.config';
import pluginsConfig from './config/pluginsConfig';
import getRobotsInfo from './config/robots';

interface IEnv {
	SITE_URL: string;
	BLOB_READ_WRITE_TOKEN: string;
	STORAGE_URL: string;
	JWT_SALT: string;
	DEV: boolean;
}

const env: IEnv = {
	SITE_URL: process.env.NUXT_PUBLIC_SITE_URL || 'https://av-dashboard-v2.vercel.app/',
	BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN || '',
	STORAGE_URL: process.env.STORAGE_URL || '',
	JWT_SALT: process.env.NUXT_JWT_SALT || '',
	DEV: process.env.NODE_ENV === 'development',
};

const breakpoints = {
	mobile: 767,
	tablet: 1279,
	laptop: 1439,
	desktop: 999999,
};

export default defineNuxtConfig({
	devtools: {
		enabled: env.DEV,
	},

	// Env
	runtimeConfig: {
		...env,
		public: {
			salt: env.JWT_SALT,
			blob: env.BLOB_READ_WRITE_TOKEN || '',
		},
		googleAuth: {
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		},
		authJs: {
			secret: process.env.AUTH_SECRET,
		},
	},

	// Server settings
	devServer: {
		port: 3000,
		host: '0.0.0.0',
	},

	// Modules
	modules: [
		'nuxt-svgo',
		'@nuxt/image',
		'@nuxtjs/robots',
		'@nuxtjs/sitemap',
		'@nuxt/ui',
		'@pinia/nuxt',
		'@nuxt/eslint',
		'@sidebase/nuxt-auth',
		'nuxt-file-storage',
	],

	build: {
		transpile: ['jsonwebtoken'],
	},

	// Route rules
	routeRules: env.DEV ? {} : {
		// Cached for 15 min
		"/api/*": {cache: {maxAge: 60 * 15}},
	},

	// Auth
	auth: {
		baseURL: process.env.AUTH_ORIGIN || env.SITE_URL,
		provider: {
			type: 'authjs',
		},
		globalAppMiddleware: true
	},

	// Color-mode
	colorMode: {
		preference: 'light',
		fallback: 'light',
	},

	// Plugins
	plugins: pluginsConfig,

	// Svg
	svgo: {
		autoImportPath: './assets/svg/',
		svgo: true,
		defaultImport: 'component',
		svgoConfig: {
			multipass: true,
			removeViewBox: false,
		},
	},

	// Eslint
	eslint: {
		config: {
			stylistic: {
				indent: 'tab',
				semi: true,
			},
		},
	},

	// Sitemap
	site: {
		url: env.SITE_URL,
	},

	// Robots
	robots: {
		rules: {
			UserAgent: '*',
			Allow: getRobotsInfo().allow,
			Disallow: getRobotsInfo().disallows,
			Host: getRobotsInfo().host,
			Sitemap: getRobotsInfo().sitemap,
			BlankLine: true,
		},
	},

	// Pinia
	pinia: {
		storesDirs: ['./stores/**'],
	},

	// Nuxt images module
	image: {
		inject: true,
		quality: 80,
		domains: [env.SITE_URL],
		screens: {...breakpoints, desktop: 1920},
		format: ['webp'],
	}, // Image end

	css: ['~/assets/css/main.css'],

	postcss: {
		plugins: {
			tailwindcss: {},
			autoprefixer: {},
		},
	},

	app: {
		head: headConfig,
		pageTransition: {name: 'page', mode: 'out-in'},
	},
});
