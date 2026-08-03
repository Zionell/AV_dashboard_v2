<script setup lang="ts">
import { round1 } from '#shared/utils/format';

interface IProps {
    project: IProject;
}

const props = defineProps<IProps>();

const projectProgress = computed((): number => {
    const allTodos = props.project.todo.length;
    const completed = props.project.todo.filter((t) => t.isCompleted).length;

    return allTodos ? round1((completed * 100) / allTodos) : 0;
});
const imageUrl = computed(() => props.project.image || '/images/default-project.svg');
</script>

<template>
    <UBlogPost
        :title="project.name"
        :description="`Progress: ${projectProgress}%`"
        :image="imageUrl"
        :to="`${ERoutes.PROJECTS}/${project.id}`"
        variant="subtle"
        orientation="horizontal"
    />
</template>
