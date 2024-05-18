<script
	setup
	lang="ts"
>
import { Role as UserRole } from '@prisma/client';
import { useUserStore } from '~/store/user';
import type { ITodo, TodoEditSchema } from '~/types/todo';

type PropsType = {
	todo: ITodo;
	isEditable: boolean;
	onClose: () => void;
	onRemove?: () => void;
	onSave?: (newVal: TodoEditSchema) => void;
};

const userStore = useUserStore();
const props = withDefaults(defineProps<PropsType>(), {
	todo: () => ({}) as ITodo,
	isEditable: false,
	onClose: () => {},
	onRemove: () => {},
	onSave: () => {},
});

const state = reactive({
	name: props.todo.name,
	description: props.todo.description as string,
});

const checkEditRights = computed(() => {
	if (!userStore.user?.role || !props.isEditable) {
		return true;
	}
	const role = userStore.user?.role as UserRole;
	return role !== UserRole.MANAGER && role !== UserRole.OWNER;
});
const isEdited = computed(() => {
	return state.description !== props.todo.description;
});

const save = () => {
	props.onSave({
		name: state.name,
		description: state.description,
	});
	props.onClose();
};
</script>

<template>
	<USlideover>
		<UCard
			class="flex flex-col flex-1"
			:ui="{
				header: {
					padding: 'sm:p-6',
				},
				body: {
					base: 'flex-1',
					padding: 'sm:p-6',
				},
				footer: {
					base: 'flex flex-wrap gap-2',
					padding: 'sm:p-6',
				},
			}"
		>
			<template #header>
				<UInput
					v-model="state.name"
					color="orange"
					size="lg"
					:disabled="checkEditRights"
				/>
			</template>

			<div class="grid gap-3 grow">
				<div class="flex flex-col gap-4">
					<UFormGroup label="Описание">
						<UTextarea
							v-model="state.description"
							color="orange"
							size="lg"
							:disabled="checkEditRights"
						/>
					</UFormGroup>
					<UFormGroup label="Исполнитель">
						<div class="flex justify-between text-sm border border-orange-400 p-2 rounded-xl">
							<div class="grow">
								{{ todo.executor.name }}
							</div>
							<p class="participants__item-time fs-14">
								{{ todo.executor?.role }}
							</p>
						</div>
					</UFormGroup>
				</div>
			</div>

			<template #footer>
				<UButton
					v-if="isEditable"
					size="xs"
					color="orange"
					square
					variant="solid"
					@click.prevent.stop="onRemove"
				>
					<template #trailing>
						<svgo-delete
							class="w-4 h-4"
						/>
					</template>
				</UButton>
				<UButton
					v-if="isEditable"
					size="xs"
					color="orange"
					square
					variant="solid"
					:disabled="!isEdited"
					@click.prevent.stop="save"
				>
					Сохранить
				</UButton>
			</template>
		</UCard>
	</USlideover>
</template>
