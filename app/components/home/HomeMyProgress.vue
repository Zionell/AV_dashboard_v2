<script setup lang="ts">
import type { ITodoProgress } from '#shared/types/todo';

interface IProps {
    progress: ITodoProgress | null;
}

const props = defineProps<IProps>();

const onload = computed(() => {
    return Math.ceil(((props.progress?.completed || 0) * 100) / (props.progress?.allTodos || 0));
});
</script>

<template>
    <BlockWrapper
        title="My progress"
        :is-empty="!props.progress?.completed"
    >
        <div class="flex items-center justify-between gap-2.5">
            <p class="text-2xl font-semibold">{{ onload }}%</p>

            <div class="flex items-center justify-center p-3 rounded-2xl bg-orange-50">
                <UIcon
                    name="i-local-progress"
                    class="w-10 h-10 text-orange-400"
                />
            </div>
        </div>
    </BlockWrapper>
</template>
