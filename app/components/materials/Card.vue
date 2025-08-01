<script setup lang="ts">
import type { Material, MaterialCategory } from '@prisma/client';

interface IMaterial extends Material {
	category: MaterialCategory;
}

type PropsType = {
	item: IMaterial;
};

const props = withDefaults(defineProps<PropsType>(), {
	item: () => ({}) as IMaterial,
});

const emit = defineEmits(['refresh']);

const toast = useToast();
const isRemoving = ref<boolean>(false);

const remove = async () => {
	try {
		isRemoving.value = true;

		await $fetch('/api/materials', {
			method: 'DELETE',
			query: {
				id: props.item.id,
			},
		});
		toast.add({
			title: `Материал ${props.item.name} успешно удален!`,
			id: 'modal-success',
			color: 'orange',
		});
		emit('refresh');
	}
	catch (e) {
		console.warn('Material card/ remove: ', e);
	}
	finally {
		isRemoving.value = false;
	}
};
const open = () => {
	window.open(props.item.sourceLink, '_blank');
};
</script>

<template>
	<UCard
		:ui="{
			base: 'h-full flex flex-col',
			ring: `ring-1 ring-gray-200 hover:ring-orange-400 ease-linear duration-150 cursor-pointer`,
			header: {
				padding: 'sm:p-3',
			},
			body: {
				base: 'grow',
				padding: 'sm:p-3',
			},
			footer: {
				base: 'flex flex-wrap gap-2',
				padding: 'sm:p-3',
			},
		}"
		@click.prevent="open"
	>
		<template #header>
			<div class="flex items-center justify-between">
				<h3 class="text-xl">
					{{ item.name }}
				</h3>
				<ColoredLabel :bg-color="item.category.color">
					{{ item.category.label }}
				</ColoredLabel>
			</div>
		</template>

		<div
			v-if="item.description"
			class=""
		>
			<p>Описание:</p>
			{{ item.description }}
		</div>

		<template #footer>
			<UButton
				class="shrink-0"
				size="xs"
				color="orange"
				square
				variant="solid"
				:loading="isRemoving"
				@click.prevent.stop="remove"
			>
				<template #trailing>
					<svgo-delete class="w-4 h-4" />
				</template>
			</UButton>
		</template>
	</UCard>
</template>
