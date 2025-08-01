<script setup lang="ts">
import type { ITodo } from '~/types/todo';
import ColoredLabel from '~/components/ColoredLabel.vue';
import TodoDetailCard from '~/components/todo/TodoDetailCard.vue';

const router = useRouter();

type PropsType = {
	todos?: ITodo[];
};

const props = withDefaults(defineProps<PropsType>(), {
	todos: () => [],
});

const slideover = useSlideover();

const isEmpty = computed(() => {
	return !props.todos.length;
});

const goToTasks = () => {
	router.push('/todo');
};

const openDetail = (todo: ITodo) => {
	slideover.open(TodoDetailCard, {
		todo: todo,
		isEditable: false,
		onClose: slideover.close,
	});
};
</script>

<template>
	<BlockWrapper
		title="Список задач"
		:is-empty="isEmpty"
	>
		<div>
			<div class="grid grid-cols-[3fr_1fr] text-xs">
				<p>Задача</p>
				<p>Статус</p>
			</div>
			<ul class="h-56 custom__scroll">
				<li
					v-for="todo in todos"
					:key="todo.id"
					class="grid grid-cols-[3fr_1fr] mt-4 items-center border border-orange-400 hover:border-orange-900 p-2 rounded-xl ease-linear duration-150 cursor-pointer"
					@click="openDetail(todo)"
				>
					<p>
						{{ todo.name }}
					</p>
					<ColoredLabel
						class="w-full"
						:bg-color="todo.todoStatus.color"
					>
						{{ todo.todoStatus.label }}
					</ColoredLabel>
				</li>
			</ul>
			<EmptyBlock v-if="isEmpty" />
			<UButton
				color="orange"
				@click="goToTasks"
			>
				Посмотреть все
			</UButton>
		</div>
	</BlockWrapper>
</template>
