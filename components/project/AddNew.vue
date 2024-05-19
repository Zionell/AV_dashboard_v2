<script
	setup
	lang="ts"
>
import {z} from 'zod';
import type {FormSubmitEvent} from '@nuxt/ui/dist/runtime/types';
import {useUserStore} from '~/store/user';
import type {UserShortType} from '~/types/user';
import {createId} from "~/utils/utils";
import {put} from "@vercel/blob";

const runtimeConfig = useRuntimeConfig()
const emit = defineEmits(['refresh']);
const userStore = useUserStore();
const toast = useToast();
const schema = z.object({
	name: z.string(),
	designUrl: z.string().optional(),
	gitHub: z.string().optional(),
	projectUrl: z.string().optional(),
});

type Schema = z.output<typeof schema>;
const state = reactive({
	name: undefined,
	designUrl: undefined,
	gitHub: undefined,
	projectUrl: undefined,
});

const files = ref(null)
const selected = ref<UserShortType[] | []>([]);
const loading = ref(false);

const selectLabel = computed(() => selected.value.map(s => s.name));

const onSearch = async (search: string) => {
	loading.value = true;

	const res = await $fetch<UserShortType[]>('/api/users/search', {
		params: {
			companyId: userStore.getCompanyId,
			search,
		},
	});

	loading.value = false;

	return res;
};
const isLoading = ref<boolean>(false);
const isOpen = ref<boolean>(false);
const handleFileInput = (evt: InputEvent) => {
	const file = evt.target?.files[0]
	if (file) {
		files.value = file
	}
}
const onSubmit = async (event: FormSubmitEvent<Schema>) => {
	try {
		isLoading.value = true;
		const users = selected.value.map(s => s.id) || [];
		let imgUrl = ''
		if (files.value) {
			const fileName = files.value?.name ?? createId();

			const {url} = await put(`projects/${fileName}`, files.value, {
				access: 'public',
				token: runtimeConfig.public.blob
			});
			imgUrl = url
		}
		await $fetch('/api/projects', {
			method: 'POST',
			body: {
				...event.data,
				imgUrl,
				users: users,
				companyId: userStore.getCompanyId,
			},
		});
		toast.add({
			title: 'Проект успешно создан!',
			id: 'modal-success',
			color: 'orange',
		});
		emit('refresh');
	} catch (e) {
		console.warn('ProjectAddNew/ onSave: ', e);
	} finally {
		isLoading.value = false;
		isOpen.value = false;
	}
};
</script>

<template>
	<div>
		<UButton
			label="Добавить проект"
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
							Новый проект
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
						label="Название"
						name="users"
					>
						<USelectMenu
							v-model="selected"
							:loading="loading"
							multiple
							:searchable="onSearch"
							searchable-placeholder="Участники"
							:search-attributes="['name']"
							clear-search-on-close
							option-attribute="name"
							by="id"
							color="orange"
							size="lg"
						>
							<template #label>
								<span
									v-if="selectLabel.length"
									class="truncate"
								>{{ selectLabel.join(", ") }}</span>
								<span v-else>Участники</span>
							</template>
						</USelectMenu>
					</UFormGroup>
					<UFormGroup
						label="Ссылка на макет"
						name="designUrl"
					>
						<UInput
							v-model="state.designUrl"
							color="orange"
							size="lg"
						/>
					</UFormGroup>
					<UFormGroup
						label="Ссылка на GitHUB"
						name="gitHub"
					>
						<UInput
							v-model="state.gitHub"
							color="orange"
							size="lg"
						/>
					</UFormGroup>
					<UFormGroup
						label="Ссылка на проект"
						name="gitHub"
					>
						<UInput
							v-model="state.projectUrl"
							color="orange"
							size="lg"
						/>
					</UFormGroup>
					<UFormGroup
						label="Превью проекта"
						name="image"
					>
						<UInput
							color="orange"
							size="lg"
							type="file"
							@input="handleFileInput"
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
