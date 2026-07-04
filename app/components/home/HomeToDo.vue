<script setup lang="ts">
import ColoredLabel from '~/components/ColoredLabel.vue';
import TodoDetailCard from '~/components/todo/TodoDetailCard.vue';

interface IProps {
    todos: ITodo[];
}

const props = defineProps<IProps>();

// const slideover = useSlideover();
const router = useRouter();

const isEmpty = computed(() => {
    return !props.todos.length;
});

const goToTasks = () => {
    router.push('/todo');
};

const openDetail = (todo: ITodo) => {
    // slideover.open(TodoDetailCard, {
    //     todo: todo,
    //     isEditable: false,
    //     onClose: slideover.close,
    // });
};
</script>

<template>
    <BlockWrapper
        title="Tasks"
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
            <UEmpty
                v-if="isEmpty"
                variant="naked"
                title="Oops... It looks like there's nothing here."
            />
            <UButton
                color="orange"
                @click="goToTasks"
            >
                Посмотреть все
            </UButton>
        </div>
    </BlockWrapper>
</template>
