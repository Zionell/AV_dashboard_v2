<script setup lang="ts">
import { formatDistanceToNow } from 'date-fns';
import type { IMaterialCard } from '#shared/types/material';
import { EViewType } from '#shared/types';

const props = defineProps<{
    item: IMaterialCard;
    view?: EViewType;
}>();

const updatedAgo = computed(() => formatDistanceToNow(new Date(props.item.updatedAt), { addSuffix: true }));

function open() {
    navigateTo(`${ERoutes.MATERIALS}/${props.item.id}`);
}
</script>

<template>
    <UPageCard
        variant="subtle"
        class="cursor-pointer hover:ring-primary transition"
        :ui="{ container: 'p-4' }"
        @click="open"
    >
        <div
            class="flex gap-3"
            :class="view === EViewType.LIST ? 'items-center' : 'flex-col h-full'"
        >
            <div
                class="flex items-start justify-between gap-2"
                :class="view === EViewType.LIST ? 'grow items-center' : ''"
            >
                <h3 class="font-semibold text-highlighted truncate">{{ item.name }}</h3>
                <ColoredLabel
                    v-if="item.category"
                    :bg-color="item.category.color"
                    class="shrink-0 uppercase text-[10px]"
                >
                    {{ item.category.label }}
                </ColoredLabel>
            </div>

            <div
                v-if="item.description && view !== EViewType.LIST"
                class="text-sm text-muted line-clamp-2 grow"
            >
                {{ item.description }}
            </div>

            <UBadge
                v-if="item.project && view !== EViewType.LIST"
                color="neutral"
                variant="subtle"
                class="w-fit"
            >
                {{ item.project.name }}
            </UBadge>

            <div
                class="flex items-center justify-between gap-2 text-xs text-muted"
                :class="view === EViewType.LIST ? 'shrink-0' : 'pt-2 border-t border-default'"
            >
                Updated {{ updatedAgo }}
            </div>
        </div>
    </UPageCard>
</template>
