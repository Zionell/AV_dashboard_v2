<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui/dist/runtime/types';
import type { MaterialCategory } from '@prisma/client';
import { useUserStore } from '~/store/user';
import { generateColorFromString } from '~/utils/colors';

const emit = defineEmits(['refresh']);
const userStore = useUserStore();
const toast = useToast();
const schema = z.object({
	name: z.string(),
	designUrl: z.string().optional(),
	gitHub: z.string().optional(),
});

type Schema = z.output<typeof schema>;
const state = reactive({
	name: undefined,
	description: undefined,
	sourceLink: undefined,
});

const selected = ref<MaterialCategory>();
const loading = ref(false);
const isLoading = ref<boolean>(false);
const isOpen = ref<boolean>(false);

const labels = computed({
	get: () => selected.value,
	set: async (label) => {
		let newValue = label;

		if (!label?.id || typeof label === 'string') {
			const newLabel = label?.label ?? label;
			const newCategory = {
				label: newLabel,
				color: `#${generateColorFromString(String(newLabel))}`,
			};

			const res = await $fetch('/api/materials/categories', {
				method: 'POST',
				body: newCategory,
			});

			if (res) {
				newValue = res;
			}
		}

		selected.value = newValue;
	},
});

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
const onSubmit = async (event: FormSubmitEvent<Schema>) => {
	try {
		isLoading.value = true;
		await $fetch('/api/materials', {
			method: 'POST',
			body: {
				...event.data,
				categoryId: selected.value?.id,
				companyId: userStore.getCompanyId,
			},
		});
		toast.add({
			title: 'Материал успешно добавлен!',
			id: 'modal-success',
			color: 'orange',
		});
		emit('refresh');
	}
	catch (e) {
		console.warn('StartSession/ onSave: ', e);
	}
	finally {
		isLoading.value = false;
		isOpen.value = false;
		state.name = undefined;
		state.description = undefined;
		state.sourceLink = undefined;
	}
};
</script>

<template>
	<div>
		<UButton
			label="Добавить материал"
			size="lg"
			color="orange"
			@click="isOpen = true"
		/>

		<UModal v-model="isOpen">
			<UCard
				:ui="{
					ring: '',
					divide: 'divide-y divide-gray-100 dark:divide-gray-800',
				}"
			>
				<template #header>
					<div class="flex items-center justify-between">
						<h3
							class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
						>
							Новый материал
						</h3>
						<UButton
							color="orange"
							variant="ghost"
							icon="i-heroicons-x-mark-20-solid"
							@click="isOpen = false"
						/>
					</div>
				</template>

				<UForm
					:schema="schema"
					:state="state"
					class="space-y-4"
					@submit="onSubmit"
				>
					<UFormGroup
						label="Название"
						name="name"
					>
						<UInput
							v-model="state.name"
							color="orange"
							size="lg"
						/>
					</UFormGroup>
					<UFormGroup
						label="Категория"
						name="category"
					>
						<USelectMenu
							v-model="labels"
							:loading="loading"
							:searchable="onSearch"
							name="categoryId"
							clear-search-on-close
							option-attribute="label"
							creatable
							by="id"
							color="orange"
							size="lg"
						>
							<template #option="{ option }">
								<span
									class="flex-shrink-0 w-2 h-2 mt-px rounded-full"
									:style="{ background: option.color }"
								/>
								<span class="truncate">{{ option.label }}</span>
							</template>

							<template #option-create="{ option }">
								<span class="flex-shrink-0">New label:</span>
								<span
									class="flex-shrink-0 w-2 h-2 mt-px rounded-full -mx-1"
									:style="{ background: `#${generateColorFromString(option.label ?? option)}` }"
								/>
								<span class="block truncate">{{ option.label ?? option }}</span>
							</template>
						</USelectMenu>
					</UFormGroup>
					<UFormGroup
						label="Описание"
						name="description"
					>
						<UTextarea
							v-model="state.description"
							color="orange"
							size="lg"
						/>
					</UFormGroup>
					<UFormGroup
						label="Ссылка"
						name="designUrl"
					>
						<UInput
							v-model="state.sourceLink"
							color="orange"
							size="lg"
						/>
					</UFormGroup>

					<div class="grid grid-cols-2 gap-2">
						<UButton
							label="Отменить"
							size="lg"
							color="orange"
							block
							:loading="isLoading"
							@click="isOpen = false"
						/>
						<UButton
							label="Сохранить"
							size="lg"
							color="orange"
							block
							:loading="isLoading"
							type="submit"
						/>
					</div>
				</UForm>
			</UCard>
		</UModal>
	</div>
</template>
