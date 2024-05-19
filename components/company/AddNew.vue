<script setup lang="ts">
import { z } from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui/dist/runtime/types';
import { useUserStore } from '~/store/user';

const headers = useRequestHeaders(['cookie']) as HeadersInit;

const { setUser } = useUserStore();
const toast = useToast();
const { data } = useAuth();
const schema = z.object({
	name: z.string(),
});

type Schema = z.output<typeof schema>;
const state = reactive({
	name: undefined,
});
const isLoading = ref<boolean>(false);
const isOpen = ref<boolean>(false);

const onSubmit = async (event: FormSubmitEvent<Schema>) => {
	try {
		isLoading.value = true;

		await $fetch('/api/company', {
			method: 'POST',
			body: {
				...event.data,
				userId: data.value?.user?.id || '',
			},
		});
		await setUser(headers);
		toast.add({
			title: 'Компания успешно создана!',
			id: 'modal-success',
			color: 'orange',
		});
		location.reload()
	}
	catch (e) {
		console.warn('StartSession/ onSave: ', e);
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
			label="Добавить новую компанию"
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
							Новая компания
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
