<script setup lang="ts">
import { format, isPast, isToday } from 'date-fns';
import type { ITaskCard } from '#shared/types/todo';

const props = defineProps<{
    task: ITaskCard;
}>();

const dueMeta = computed(() => {
    if (!props.task.dueDate) return null;

    const due = new Date(props.task.dueDate);
    const overdue = isPast(due) && !isToday(due) && !props.task.isCompleted;

    return {
        label: format(due, 'MMM d'),
        overdue,
        today: isToday(due),
    };
});
</script>

<template>
    <UPageCard
        variant="subtle"
        class="cursor-pointer hover:ring-primary transition"
        :ui="{ container: 'p-3 sm:p-3 gap-y-2' }"
    >
        <div class="flex items-start justify-between gap-2">
            <h4 class="text-sm font-medium text-highlighted">{{ task.name }}</h4>
            <UBadge
                v-if="task.priority"
                :color="taskPriorityColor(task.priority)"
                variant="subtle"
                size="sm"
                class="shrink-0 uppercase text-[10px]"
            >
                {{ taskPriorityLabel(task.priority) }}
            </UBadge>
        </div>

        <p
            v-if="task.project"
            class="text-xs text-primary truncate"
        >
            {{ task.project.name }}
        </p>

        <div class="flex items-center justify-between gap-2 text-xs text-muted">
            <span
                v-if="dueMeta"
                class="flex items-center gap-1"
                :class="dueMeta.overdue ? 'text-error font-medium' : ''"
            >
                <UIcon
                    name="i-lucide-calendar"
                    class="w-3.5 h-3.5"
                />
                {{ dueMeta.label }}
                <UBadge
                    v-if="dueMeta.today"
                    color="warning"
                    variant="subtle"
                    size="sm"
                    class="text-[9px]"
                >
                    today
                </UBadge>
            </span>
            <span v-else />

            <span class="flex items-center gap-2">
                <span
                    v-if="task.commentsCount"
                    class="flex items-center gap-0.5"
                >
                    <UIcon
                        name="i-lucide-message-circle"
                        class="w-3.5 h-3.5"
                    />
                    {{ task.commentsCount }}
                </span>
                <span
                    v-if="task.attachmentsCount"
                    class="flex items-center gap-0.5"
                >
                    <UIcon
                        name="i-lucide-paperclip"
                        class="w-3.5 h-3.5"
                    />
                    {{ task.attachmentsCount }}
                </span>

                <span
                    v-if="task.estimateHours"
                    class="flex items-center gap-0.5"
                >
                    <UIcon
                        name="i-lucide-timer"
                        class="w-3.5 h-3.5"
                    />
                    {{ task.estimateHours }}h
                </span>

                <UTooltip :text="task.executor?.name || '—'">
                    <UAvatar
                        :src="task.executor?.image || ''"
                        :alt="task.executor?.name || ''"
                        size="2xs"
                    />
                </UTooltip>
            </span>
        </div>
    </UPageCard>
</template>
