<script
	setup
	lang="ts"
>
import type { TodoStatus } from '@prisma/client';
import type { ITodo } from '~/types/todo';

type PropsType = {
	todos: ITodo[];
	status: TodoStatus[];
};

const emit = defineEmits(['refresh']);
const props = withDefaults(defineProps<PropsType>(), {
	todos: () => [],
	status: () => [],
});

const isLoading = ref<boolean>(false);

const filterTodo = (status: string) => {
	return props.todos.filter(todo => todo.todoStatusId === status);
};

const onDragStart = (ev: DragEvent, todoId: string) => {
	if (!ev?.dataTransfer) {
		return;
	}
	ev.dataTransfer.dropEffect = 'move';
	ev.dataTransfer.setData('todoId', todoId.toString());
};
const onDrop = async (ev: DragEvent, statusId: string) => {
	if (!ev?.dataTransfer) {
		return;
	}

	try {
		const todoId = ev.dataTransfer.getData('todoId');
		isLoading.value = true;

		await $fetch('/api/todo/status', {
			method: 'PUT',
			params: {
				id: todoId,
				statusId,
			},
		});
		emit('refresh');
	}
	catch (e) {
		console.warn('TodoChangeStatus/ onSave: ', e);
	}
	finally {
		isLoading.value = false;
	}
};
</script>

<template>
	<ul class="flex gap-7 overflow-hidden overscroll-x-auto">
		<UCard
			v-for="item in status"
			:key="item.id"
			as="li"
			class="w-80 mr-4"
			:ui="{
				header: {
					padding: 'sm:py-2',
				},
			}"
			@drop="onDrop($event, item.id)"
			@dragenter.prevent
			@dragover.prevent
		>
			<template #header>
				<ColoredLabel :bg-color="item.color">
					{{ item.label }}
				</ColoredLabel>
			</template>

			<ul class="grid gap-4">
				<TodoCard
					v-for="todo in filterTodo(item.id)"
					:key="todo.id"
					draggable="true"
					:todo="todo"
					@dragstart="onDragStart($event, todo.id)"
					@refresh="emit('refresh')"
				/>
			</ul>
		</UCard>
	</ul>
</template>
