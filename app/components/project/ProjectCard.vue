<script setup lang="ts">
interface IProps {
    project: IProject;
}

const props = defineProps<IProps>();

const projectProgress = computed((): number => {
    const allTodos = props.project.todo.length;
    const completed = props.project.todo.filter((t) => t.isCompleted).length;

    const progress = (completed * 100) / allTodos;
    return progress || 0;
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
