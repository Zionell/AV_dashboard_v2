<script setup lang="ts">
import { useUserStore } from '~/store/user';

const userStore = useUserStore();

const pageInfo = ref({
	take: 10,
	skip: 0,
});
const page = ref(1);

const { data, refresh } = await useAsyncData(async () => {
	const [materials] = await Promise.all([
		$fetch('/api/materials', {
			query: {
				userId: userStore.getUserId,
				take: pageInfo.value.take,
				skip: pageInfo.value.take * (page.value - 1),
			},
		}),
	]);

	return {
		list: materials.material,
		count: materials.count,
	};
}, {
	watch: [page],
});

const isHasNext = computed(() => {
	if (!data?.value?.count) {
		return false;
	}
	return data.value.count > pageInfo.value.take;
});
</script>

<template>
	<section class="grid gap-8">
		<div class="flex items-center justify-between">
			<CurrentDate />
			<MaterialsAddNew
				@refresh="refresh"
			/>
		</div>
		<ul class="grid grid-cols-3 gap-7">
			<li
				v-for="item in data?.list"
				:key="item.id"
			>
				<MaterialsCard
					:item="item"
					@refresh="refresh"
				/>
			</li>
		</ul>

		<div
			v-if="isHasNext"
			class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700"
		>
			<UPagination
				v-model="page"
				:page-count="pageInfo.take"
				:total="data?.count || 10"
			/>
		</div>
	</section>
</template>
