<script
	setup
	lang="ts"
>
import TodoDetailCard from '~/components/todo/TodoDetailCard.vue';
import type { ITodo, TodoEditSchema } from '~/types/todo';

type PropsType = {
	todo: ITodo;
};

const props = withDefaults(defineProps<PropsType>(), {
	todo: () => ({}) as ITodo,
});

const emit = defineEmits(['refresh']);

const slideover = useSlideover();
const toast = useToast();
const isLoading = ref<boolean>(false);

const save = async (newVal: TodoEditSchema) => {
	try {
		isLoading.value = true;

		await $fetch('/api/todo', {
			method: 'PUT',
			query: {
				id: props.todo.id,
			},
			body: {
				...newVal,
			},
		});
		toast.add({
			title: `Задача успешно обновлена!`,
			id: 'modal-success',
			color: 'orange',
		});
		emit('refresh');
	}
	catch (e) {
		console.warn('Todo card/ save: ', e);
	}
	finally {
		isLoading.value = false;
	}
};

const remove = async () => {
	try {
		isLoading.value = true;

		await $fetch('/api/todo', {
			method: 'DELETE',
			query: {
				id: props.todo.id,
			},
		});
		toast.add({
			title: `Задача успешно удалена!`,
			id: 'modal-success',
			color: 'orange',
		});
		emit('refresh');
	}
	catch (e) {
		console.warn('Todo card/ remove: ', e);
	}
	finally {
		isLoading.value = false;
	}
};
const complete = async () => {
	try {
		isLoading.value = true;

		await $fetch('/api/todo', {
			method: 'PUT',
			query: {
				id: props.todo.id,
			},
			body: {
				isCompleted: true,
			},
		});
		emit('refresh');
	}
	catch (e) {
		console.warn('Todo card/ complete: ', e);
	}
	finally {
		isLoading.value = false;
	}
};

const openDetail = () => {
	if (props.todo.isCompleted) {
		return;
	}
	slideover.open(TodoDetailCard, {
		todo: props.todo,
		isEditable: true,
		onRemove: remove,
		onSave: save,
		onClose: slideover.close,
	});
};
</script>

<template>
	<UCard
		as="li"
		:ui="{
			ring: `ring-1 ring-gray-200 dark:ring-gray-800 ${todo.isCompleted ? 'ring-orange-400' : 'hover:ring-gray-900 ease-linear duration-150 cursor-pointer'}`,
			header: {
				padding: 'sm:p-3',
			},
			body: {
				padding: 'sm:p-3',
			},
			footer: {
				base: 'flex flex-wrap gap-2',
				padding: 'sm:p-3',
			},
		}"
		@click.prevent="openDetail"
	>
		<template #header>
			<div class="flex items-center justify-between">
				<h3 class="text-xl">
					{{ todo.name }}
				</h3>
			</div>
		</template>

		<div class="grid gap-3">
			<div class="flex flex-col gap-4">
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
				size="xs"
				color="orange"
				square
				variant="solid"
				:loading="isLoading"
				@click.prevent.stop="remove"
			>
				<template #trailing>
					<svgo-delete
						class="w-4 h-4"
					/>
				</template>
			</UButton>
			<UButton
				size="xs"
				color="orange"
				square
				variant="solid"
				:disabled="todo.isCompleted"
				:loading="isLoading"
				@click.prevent.stop="complete"
			>
				Закрыть задачу
			</UButton>
		</template>
	</UCard>
</template>
