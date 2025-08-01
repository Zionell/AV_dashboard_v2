<script
	setup
	lang="ts"
>
import { hexToRgb } from '~/utils/colors';

const props = defineProps({
	bgColor: {
		type: String,
		default: '',
	},
});

const textColor = ref<string>('#000000');

const isDark = () => {
	const rgb = hexToRgb(props.bgColor);
	if (rgb.length) {
		const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
		return brightness < 128;
	}
};

onMounted(() => {
	if (isDark()) {
		textColor.value = '#ffffff';
	}
	else {
		textColor.value = '#000000';
	}
});
</script>

<template>
	<div
		class="flex items-center justify-center w-fit py-1 px-5 rounded-lg"
		:style="{ background: bgColor, color: textColor }"
	>
		<slot />
	</div>
</template>
