<script setup lang="ts">
import { formatDistanceToNow } from 'date-fns';
import { getTodoColor } from '#server/utils/common';
import type { ETodoStatus } from '#shared/types/times';
import type { IProjectRecentTask } from '#shared/types/projects';

const props = defineProps<{
    tasks: IProjectRecentTask[];
}>();

function statusColor(status: ETodoStatus) {
    return getTodoColor(status) as 'success' | 'secondary' | 'warning' | 'neutral';
}
</script>

<template>
    <BlockWrapper
        title="Recent Tasks"
        :is-empty="!props.tasks.length"
    >
        <ul class="divide-y divide-default">
            <li
                v-for="task in props.tasks"
                :key="task.id"
                class="flex items-center gap-2 py-3 px-4"
            >
                <div class="min-w-0 grow">
                    <p class="text-sm font-medium text-highlighted truncate">{{ task.name }}</p>
                    <p class="text-xs text-muted">
                        {{ formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true }) }}
                    </p>
                </div>
                <UBadge
                    :color="statusColor(task.status)"
                    variant="subtle"
                    class="capitalize shrink-0"
                >
                    {{ task.status.toLowerCase().replace('_', ' ') }}
                </UBadge>
            </li>
        </ul>
    </BlockWrapper>
</template>
