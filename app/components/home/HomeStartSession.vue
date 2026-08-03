<script setup lang="ts">
const timeStore = useTimesStore();

const todoId = ref<string | undefined>();

const { data: todos } = await useLazyFetch('/api/todo/specs', {
    default: () => [],
});

const todoItems = computed(() => [...(todos.value || []).map((t) => ({ label: t.name, value: t.id }))]);

const selectedTodo = computed(() => todos.value?.find((t) => t.id === todoId.value));

function toggle() {
    // Остановка не требует задачи — и не может её получить: селект скрыт во время
    // сессии, а после перезагрузки страницы todoId пуст. Раньше проверка стояла на
    // оба случая, из-за чего кнопка «End session» молча ничего не делала.
    if (timeStore.isActive) {
        timeStore.changeSessionStatus();

        return;
    }

    if (!selectedTodo.value) return;

    timeStore.changeSessionStatus({
        todoId: todoId.value,
        projectId: selectedTodo.value.projectId,
    });
}
</script>

<template>
    <UCard variant="subtle">
        <div class="grid gap-3 min-w-52">
            <div class="flex items-center justify-between gap-4">
                <transition
                    name="rotate"
                    mode="out-in"
                >
                    <div :key="`title_${timeStore.isActive}`">
                        {{ timeStore.isActive ? 'End session' : 'Start session' }}
                    </div>
                </transition>

                <UButton
                    size="xl"
                    square
                    :loading="timeStore.isLoading"
                    :disabled="!timeStore.isActive && !selectedTodo"
                    @click="toggle"
                >
                    <transition
                        name="rotate"
                        mode="out-in"
                    >
                        <UIcon
                            v-if="timeStore.isActive"
                            name="i-local-stop"
                            class="h-auto w-3/5 mx-auto relative z-10"
                        />
                        <UIcon
                            v-else
                            name="i-local-play"
                            class="h-auto w-3/5 mx-auto relative z-10"
                        />
                    </transition>
                </UButton>
            </div>

            <template v-if="!timeStore.isActive">
                <USelect
                    v-model="todoId"
                    :items="todoItems"
                    placeholder="Task"
                    size="sm"
                />
            </template>
        </div>
    </UCard>
</template>
