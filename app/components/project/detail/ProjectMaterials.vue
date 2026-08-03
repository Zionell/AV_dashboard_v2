<script setup lang="ts">
import type { IProjectMaterialShort } from '#shared/types/projects';

const props = defineProps<{
    materials: IProjectMaterialShort[];
    projectId: string;
}>();
</script>

<template>
    <UPageCard
        variant="subtle"
        :ui="{ container: 'p-0 sm:p-0 gap-y-2' }"
    >
        <div class="flex items-center justify-between p-4 pb-0">
            <h3 class="font-semibold text-highlighted">Materials</h3>
            <UButton
                label="View all"
                variant="outline"
                color="neutral"
                size="xs"
                :to="`${ERoutes.MATERIALS}?projectId=${props.projectId}`"
            />
        </div>

        <UEmpty
            v-if="!props.materials.length"
            variant="naked"
            title="Oops... It looks like there's nothing here."
        />
        <ul
            v-else
            class="divide-y divide-default"
        >
            <li
                v-for="material in props.materials"
                :key="material.id"
            >
                <NuxtLink
                    :to="`${ERoutes.MATERIALS}/${material.id}`"
                    class="flex items-center gap-3 py-3 px-4 hover:bg-elevated/50 transition"
                >
                    <UIcon
                        name="i-lucide-file-text"
                        class="w-4 h-4 text-muted shrink-0"
                    />
                    <span class="text-sm font-medium text-highlighted truncate grow">{{ material.name }}</span>
                    <ColoredLabel
                        v-if="material.category"
                        :bg-color="material.category.color"
                        class="shrink-0 uppercase text-[10px]"
                    >
                        {{ material.category.label }}
                    </ColoredLabel>
                </NuxtLink>
            </li>
        </ul>
    </UPageCard>
</template>
