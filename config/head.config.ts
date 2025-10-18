import { faviconsLinks, faviconsMeta } from "./head/favicons";
import type { AppConfig } from "@nuxt/schema";

const base_url = process.env.SITE_URL;

const title: string = "AV_Dashboard";
const description: string =
	"Управляйте процессом разработки с помощью нашего мощного инструмента для управления задачами. Наш сайт предлагает множество возможностей для организации и управления проектами, включая планирование, трекинг, отслеживание и отчетность. Общайтесь с командой, делитесь файлами и совместно решайте задачи в одном месте. Присоединяйтесь к нам сейчас и управляйте разработкой эффективно и профессионально.";
const imageUrl: string = "/images/seo.png";

export const headConfig: AppConfig["head"] = {
	htmlAttrs: { lang: "ru" },

	title: title,

	// Head meta
	meta: [
		{ charset: "utf-8" },
		{ name: "viewport", content: "width=device-width, initial-scale=1" },

		{
			hid: "description",
			name: "description",
			content: description,
		},

		// Open Graph / Facebook / WhatsApp
		{ hid: "og:type", name: "og:type", content: "website" },
		{ hid: "og:url", name: "og:url", content: base_url },
		{ hid: "og:title", name: "og:title", content: title },
		{
			hid: "og:site_name",
			name: "og:site_name",
			content: title,
		},
		{
			hid: "og:description",
			name: "og:description",
			content: description,
		},
		{ hid: "og:image", name: "og:image", content: imageUrl },
		{ hid: "og:image:width", name: "og:image:width", content: "300" },
		{ hid: "og:image:height", name: "og:image:height", content: "300" },

		// Twitter
		{
			hid: "twitter:card",
			name: "twitter:card",
			content: "summary_large_image",
		},
		{ hid: "twitter:url", name: "twitter:url", content: base_url },
		{
			hid: "twitter:title",
			name: "twitter:title",
			content: title,
		},
		{
			hid: "twitter:description",
			name: "twitter:description",
			content: description,
		},
		{ hid: "twitter:image", name: "twitter:image", content: imageUrl },

		// Favicons
		...faviconsMeta,
	],

	// Head links
	link: [
		// Favicons
		...(Array.isArray(faviconsLinks) ? faviconsLinks : []),
	],

	__dangerouslyDisableSanitizers: ["script", "noscript"],
};
