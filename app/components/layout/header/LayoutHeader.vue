<script setup lang="ts">
import { PAGES } from "~/assets/ts/pages";

const route = useRoute();

const title = computed(() => {
	return Object.values(PAGES).find((i) => i.link === route.fullPath)?.label;
});
</script>

<template>
	<header class="flex items-center justify-between px-6">
		<h5 class="select-none text-2xl font-black">
			{{ title }}
		</h5>

		<div class="flex items-center justify-end gap-2">
			<LayoutHeaderAccount v-if="false" />
		</div>
	</header>
</template>
