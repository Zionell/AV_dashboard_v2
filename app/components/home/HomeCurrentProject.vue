<script setup lang="ts">
import type { Project } from '@prisma/client';

interface IProps {
    currentProject: Project | null;
}

const props = defineProps<IProps>();

const isEmpty = computed(() => !props.currentProject?.id);
</script>

<template>
    <BlockWrapper
        title="Текущий проект"
        :is-empty="isEmpty"
    >
        <div class="flex items-center justify-between gap-2.5">
            <h3
                v-if="props.currentProject?.name"
                class="font-medium text-2xl"
            >
                {{ props.currentProject.name }}
            </h3>

            <div class="flex items-center justify-center p-3 rounded-2xl bg-orange-50">
                <UIcon
                    name="i-local-folder"
                    class="w-10 h-10 text-orange-400"
                />
            </div>
        </div>
    </BlockWrapper>
</template>
