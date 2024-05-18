<script setup lang="ts">
import { useMenuStore } from '~/store/menu';

const route = useRoute();
const { mainMenu } = useMenuStore();

const title = computed(() => {
	return mainMenu.find(i => i.name === route.name)?.label;
});
</script>

<template>
	<header class="flex items-center justify-between px-6">
		<h5 class="select-none text-2xl font-black">
			{{ title }}
		</h5>
		<div class="flex items-center justify-end gap-2">
			<LayoutHeaderAccount />
		</div>
	</header>
</template>
