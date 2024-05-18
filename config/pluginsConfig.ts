type PluginsWithModeType = {
	src: string;
	mode: 'client';
};

type PluginsStringType = string;

type PluginsType = PluginsStringType | PluginsWithModeType;

const pluginsConfig: PluginsType[] = [
	'~/config/plugins/vue-touch-events',
];

export default pluginsConfig;
