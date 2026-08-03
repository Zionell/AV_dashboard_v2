<script setup lang="ts">
import { formatDistanceToNow } from 'date-fns';
import { EProjectEventType, type IProjectEvent } from '#shared/types/projects';

const props = defineProps<{
    events: IProjectEvent[];
}>();

const EVENT_ICONS: Record<EProjectEventType, string> = {
    [EProjectEventType.PROJECT_CREATED]: 'i-lucide-folder-plus',
    [EProjectEventType.PROJECT_UPDATED]: 'i-lucide-folder-pen',
    [EProjectEventType.TASK_CREATED]: 'i-lucide-plus',
    [EProjectEventType.TASK_UPDATED]: 'i-lucide-pencil',
    [EProjectEventType.TASK_STATUS_CHANGED]: 'i-lucide-arrow-right-left',
    [EProjectEventType.TASK_DELETED]: 'i-lucide-trash',
    [EProjectEventType.COMMENT_ADDED]: 'i-lucide-message-circle',
    [EProjectEventType.ATTACHMENT_ADDED]: 'i-lucide-paperclip',
};

const STATUS_LABELS: Record<string, string> = {
    TODO: 'Todo',
    IN_PROGRESS: 'In Progress',
    REVIEW: 'Review',
    DONE: 'Done',
};

function eventText(item: IProjectEvent) {
    const actor = item.actor?.name || 'Someone';
    const target = item.targetName ? `"${item.targetName}"` : '';

    switch (item.type) {
        case EProjectEventType.PROJECT_CREATED:
            return `${actor} created project ${target}`;
        case EProjectEventType.PROJECT_UPDATED:
            return `${actor} updated the project`;
        case EProjectEventType.TASK_CREATED:
            return `${actor} created task ${target}`;
        case EProjectEventType.TASK_UPDATED:
            return `${actor} updated task ${target}`;
        case EProjectEventType.TASK_STATUS_CHANGED: {
            const to = STATUS_LABELS[item.meta?.to || ''] || item.meta?.to;

            return `${actor} moved ${target} to ${to}`;
        }
        case EProjectEventType.TASK_DELETED:
            return `${actor} deleted task ${target}`;
        case EProjectEventType.COMMENT_ADDED:
            return `${actor} commented on ${target}`;
        case EProjectEventType.ATTACHMENT_ADDED:
            return `${actor} attached a file to ${target}`;
        default:
            return actor;
    }
}

function ago(item: IProjectEvent) {
    return formatDistanceToNow(new Date(item.createdAt), { addSuffix: true });
}
</script>

<template>
    <UPageCard
        title="Recent Activity"
        variant="subtle"
        :ui="{ container: 'p-4 sm:p-4 gap-y-2' }"
    >
        <ul
            v-if="props.events.length"
            class="grid gap-3 text-sm"
        >
            <li
                v-for="item in props.events"
                :key="item.id"
                class="flex items-center gap-3"
            >
                <UIcon
                    :name="EVENT_ICONS[item.type] || 'i-lucide-activity'"
                    class="w-4 h-4 text-muted shrink-0"
                />
                <span
                    class="grow truncate"
                    :title="eventText(item)"
                >
                    {{ eventText(item) }}
                </span>
                <span class="text-xs text-muted shrink-0">{{ ago(item) }}</span>
            </li>
        </ul>
        <p
            v-else
            class="text-sm text-muted"
        >
            No activity yet.
        </p>
    </UPageCard>
</template>
