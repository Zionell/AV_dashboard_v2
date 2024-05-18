<script setup lang="ts">
import type { Material, MaterialCategory } from '@prisma/client';

interface IMaterial extends Material {
	category: MaterialCategory;
}

type PropsType = {
	items: IMaterial[];
};

const props = withDefaults(defineProps<PropsType>(), {
	items: () => [],
});

const selected = ref<MaterialCategory[] | []>([]);
const loading = ref(false);

const isEmpty = computed(() => !props.items.length);
const filtered = computed(() => props.items.filter((item: Material) => {
	const keys = selected.value.map(s => s.id);

	if (!keys.length) {
		return item;
	}

	return keys.includes(item.categoryId);
}));
const selectLabel = computed(() => selected.value.map(s => s.label));

const onSearch = async (search: string) => {
	loading.value = true;

	const res = await $fetch<MaterialCategory[]>('/api/materials/categories', {
		params: {
			search,
		},
	});

	loading.value = false;

	return res;
};
const open = (link: string) => {
	window.open(link, '_blank');
};
</script>

<template>
	<BlockWrapper
		title="Полезные материалы"
		:is-empty="isEmpty"
	>
		<div>
			<USelectMenu
				v-model="selected"
				:loading="loading"
				multiple
				:searchable="onSearch"
				searchable-placeholder="Введите название категории"
				:search-attributes="['label']"
				clear-search-on-close
				option-attribute="label"
				by="id"
				color="orange"
			>
				<template #label>
					<span
						v-if="selectLabel.length"
						class="truncate"
					>{{ selectLabel.join(', ') }}</span>
					<span v-else>Категории</span>
				</template>
				<template #option="{ option: item }">
					<div
						class="h-5 w-5 rounded-full mr-4"
						:style="{ background: item.color }"
					/>
					<span class="truncate">{{ item.label }}</span>
				</template>
			</USelectMenu>
			<ul
				v-if="items.length"
				class="h-56 mt-4 custom__scroll"
			>
				<li
					v-for="material in filtered"
					:key="material.id"
					class="flex items-center justify-between rounded-xl gap-5 p-2 mb-4 border border-orange-300 hover:border-orange-700 ease-linear duration-150 cursor-pointer"
					@click="open(material.sourceLink)"
				>
					<div
						class="w-5 h-5 rounded-full"
						:style="{ background: material.category.color }"
					/>
					<div class="flex-grow">
						{{ material.name }}
					</div>
				</li>
			</ul>
		</div>
	</BlockWrapper>
</template>
