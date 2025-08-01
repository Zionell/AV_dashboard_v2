<script setup lang="ts">
defineProps({
	title: {
		type: String,
		default: '',
	},

	isLoading: {
		type: Boolean,
		default: false,
	},

	isEmpty: {
		type: Boolean,
		default: false,
	},

	isShowTooltip: {
		type: Boolean,
		default: false,
	},
});
</script>

<template>
	<section class="flex flex-col h-full p-7 rounded-3xl bg-white shadow-2xl">
		<div
			v-if="title"
			class="flex items-center justify-between mb-6"
		>
			<h3 class="text-xl font-medium">
				{{ title }}
			</h3>

			<UPopover v-if="isShowTooltip">
				<UButton
					size="sm"
					color="orange"
					square
					variant="ghost"
				>
					<template #trailing>
						<svgo-tooltip class="w-3 h-3" />
					</template>
				</UButton>

				<template #panel>
					<div class="p-4">
						test
					</div>
				</template>
			</UPopover>
		</div>

		<div class="flex flex-col grow">
			<transition
				name="fade"
				mode="out-in"
			>
				<Preloader v-if="isLoading" />
				<EmptyBlock v-else-if="isEmpty" />
				<div v-else>
					<slot />
				</div>
			</transition>
		</div>
	</section>
</template>
