import type { Config } from 'tailwindcss';

export default {
	darkMode: 'class',
	content: [
		'./components/**/*.{js,vue,ts}',
		'./layouts/**/*.vue',
		'./pages/**/*.vue',
		'./plugins/**/*.{js,ts}',
		'./error.vue',
	],
	theme: {
		extend: {
			fontFamily: {
				custom: ['Itim', 'sans-serif'],
			},
			fontSize: {
				error: [
					'25vw',
					{
						lineHeight: '120%',
						letterSpacing: '-0.01em',
						fontWeight: '900',
					},
				],
			},
			gridTemplateRows: {
				'layout-row': '5rem 1fr',
			},
			gridTemplateColumns: {
				'layout-col': '16rem 1fr',
				'4/1': '4fr 1fr',
			},
		},
	},
	plugins: [],
} satisfies Config;
