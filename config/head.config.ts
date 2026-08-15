import { faviconsLinks, faviconsMeta } from './head/favicons';
import type { NuxtAppConfig } from '@nuxt/schema';

const base_url = process.env.SITE_URL;

const title: string = 'AV_Dashboard';
const description: string =
    'Управляйте процессом разработки с помощью нашего мощного инструмента для управления задачами. Наш сайт предлагает множество возможностей для организации и управления проектами, включая планирование, трекинг, отслеживание и отчетность. Общайтесь с командой, делитесь файлами и совместно решайте задачи в одном месте. Присоединяйтесь к нам сейчас и управляйте разработкой эффективно и профессионально.';
const imageUrl: string = '/images/seo.png';

export const headConfig: NuxtAppConfig['head'] = {
    htmlAttrs: { lang: 'ru' },

    title: title,

    // Head meta
    meta: [
        { charset: 'utf-8' },
        {
            name: 'viewport',
            content: 'width=device-width, initial-scale=1',
        },

        {
            name: 'description',
            content: description,
        },

        // Open Graph / Facebook / WhatsApp
        {
            name: 'og:type',
            content: 'website',
        },
        {
            name: 'og:url',
            content: base_url,
        },
        {
            name: 'og:title',
            content: title,
        },
        {
            name: 'og:site_name',
            content: title,
        },
        {
            name: 'og:description',
            content: description,
        },
        {
            name: 'og:image',
            content: imageUrl,
        },
        {
            name: 'og:image:width',
            content: '300',
        },
        {
            name: 'og:image:height',
            content: '300',
        },

        // Twitter
        {
            name: 'twitter:card',
            content: 'summary_large_image',
        },
        {
            name: 'twitter:url',
            content: base_url,
        },
        {
            name: 'twitter:title',
            content: title,
        },
        {
            name: 'twitter:description',
            content: description,
        },
        {
            name: 'twitter:image',
            content: imageUrl,
        },

        // Favicons
        ...faviconsMeta,
    ],

    // Head links
    link: [
        // Favicons
        ...faviconsLinks,
    ],
};
