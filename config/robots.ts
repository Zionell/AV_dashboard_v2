interface IRobots {
	disallows: string[];
	allow: string[];
	sitemap: string;
	host: string;
}

export default function getRobotsInfo(): IRobots {
	const disallows = [
		'*',
	];

	const allow = ['/*.css', '/*.js', '/*.png', '/*.jpg'];

	const sitemap = 'https://dashboard.askarov.dev/sitemap.xml';
	const host = 'dashboard.askarov.dev';

	return {
		disallows,
		allow,
		sitemap,
		host,
	};
}
