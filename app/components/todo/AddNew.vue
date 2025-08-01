<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui/dist/runtime/types';
import type { TodoStatus } from '@prisma/client';
import { useUserStore } from '~/store/user';
import type { ProjectSpec } from '~/types/projects';
import type { UserSpecType } from '~/types/user';
import { generateColorFromString } from '~/utils/colors';

const emit = defineEmits(['refresh']);
const userStore = useUserStore();
const toast = useToast();
const schema = z.object({
	name: z.string(),
	description: z.string().optional(),
	projectId: z.object({
		name: z.string(),
		id: z.string(),
	}),
	executorId: z.object({
		name: z.string(),
		id: z.string(),
	}),
});

type Schema = z.output<typeof schema>;
const state = reactive({
	name: undefined,
	description: undefined,
	projectId: undefined,
	executorId: undefined,
});

const selected = ref<TodoStatus>();
const loadingProject = ref(false);
const loadingUser = ref(false);
const loadingStatus = ref(false);
const isLoading = ref<boolean>(false);
const isOpen = ref<boolean>(false);

const labels = computed({
	get: () => selected.value,
	set: async (label) => {
		const promises = label;

		if (!label?.id || typeof label === 'string') {
			const newLabel = label?.label ?? label;
			const newCategory = {
				label: newLabel,
				color: `#${generateColorFromString(String(newLabel))}`,
			};

			await $fetch('/api/todo/status', {
				method: 'POST',
				body: newCategory,
			});
		}

		selected.value = promises;
	},
});

const onSearchProject = async (search: string) => {
	loadingProject.value = true;

	const res = await $fetch<ProjectSpec[]>('/api/projects/specs', {
		params: {
			companyId: userStore.getCompanyId,
			search,
		},
	});

	loadingProject.value = false;

	return res;
};
const onSearchUser = async (search: string) => {
	loadingUser.value = true;

	const res = await $fetch<UserSpecType[]>('/api/users/specs', {
		params: {
			companyId: userStore.getCompanyId,
			search,
		},
	});

	loadingUser.value = false;

	return res;
};
const onSearchStatus = async (search: string) => {
	loadingStatus.value = true;

	const res = await $fetch<TodoStatus[]>('/api/todo/status', {
		params: {
			search,
		},
	});

	loadingStatus.value = false;

	return res;
};

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
	try {
		isLoading.value = true;

		await $fetch('/api/todo', {
			method: 'POST',
			body: {
				...event.data,
				projectId: event.data.projectId.id,
				executorId: event.data.executorId.id,
				todoStatusId: selected.value?.id,
			},
		});
		toast.add({
			title: 'Задача успешно создана!',
			id: 'modal-success',
			color: 'orange',
		});
		emit('refresh');
	}
	catch (e) {
		console.warn('TodoAddNew/ onSave: ', e);
	}
	finally {
		isLoading.value = false;
		isOpen.value = false;
	}
};
</script>

<template>
	<div>
		<UButton
			label="Добавить задачу"
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
							Новая задача
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
						label="Проект"
						name="projectId"
					>
						<USelectMenu
							v-model="state.projectId"
							:loading="loadingProject"
							:searchable="onSearchProject"
							searchable-placeholder="Проект"
							:search-attributes="['name']"
							clear-search-on-close
							option-attribute="name"
							by="id"
							color="orange"
							size="lg"
						/>
					</UFormGroup>
					<UFormGroup
						label="Исполнитель"
						name="executorId"
					>
						<USelectMenu
							v-model="state.executorId"
							:loading="loadingUser"
							:searchable="onSearchUser"
							searchable-placeholder="Исполнитель"
							:search-attributes="['name']"
							clear-search-on-close
							option-attribute="name"
							by="id"
							color="orange"
							size="lg"
						/>
					</UFormGroup>
					<UFormGroup
						label="Статус"
						name="todoStatusId"
					>
						<USelectMenu
							v-model="labels"
							:loading="loadingStatus"
							:searchable="onSearchStatus"
							name="todoStatusId"
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
