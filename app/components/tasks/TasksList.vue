<script setup lang="ts">
import { format, isPast, isToday } from 'date-fns';
import type { ITaskCard } from '#shared/types/todo';

const props = defineProps<{
    tasks: ITaskCard[];
    isLoading?: boolean;
}>();

const emit = defineEmits<{
    open: [task: ITaskCard];
}>();

function dueLabel(task: ITaskCard) {
    return task.dueDate ? format(new Date(task.dueDate), 'MMM d') : null;
}

function isOverdue(task: ITaskCard) {
    if (!task.dueDate || task.isCompleted) return false;

    const due = new Date(task.dueDate);

    return isPast(due) && !isToday(due);
}
</script>

<template>
    <div class="grid gap-3">
        <!-- Лоадер занимает место списка целиком: под ним держим прежнюю высоту,
             чтобы пагинация не прыгала вверх на время запроса. -->
        <div
            v-if="props.isLoading"
            class="grid place-items-center min-h-64"
        >
            <Preloader />
        </div>

        <template v-else>
            <UPageCard
                v-for="task in props.tasks"
                :key="task.id"
                variant="subtle"
                class="cursor-pointer hover:ring-primary transition"
                :ui="{ container: 'p-4 sm:p-4' }"
                @click="emit('open', task)"
            >
                <div class="flex items-start justify-between gap-4">
                    <div class="min-w-0 grid gap-1">
                        <h3 class="font-semibold text-highlighted truncate">{{ task.name }}</h3>
                        <p
                            v-if="task.project"
                            class="text-xs text-primary truncate"
                        >
                            {{ task.project.name }}
                        </p>
                        <p
                            v-if="task.description"
                            class="text-sm text-muted line-clamp-1"
                        >
                            {{ task.description }}
                        </p>
                    </div>

                    <div class="flex items-center gap-2 shrink-0">
                        <UBadge
                            v-if="task.priority"
                            :color="taskPriorityColor(task.priority)"
                            variant="subtle"
                            class="uppercase text-[10px]"
                        >
                            {{ taskPriorityLabel(task.priority) }}
                        </UBadge>
                        <UBadge
                            :color="taskStatusColor(task.status)"
                            variant="subtle"
                        >
                            {{ taskStatusLabel(task.status) }}
                        </UBadge>
                    </div>
                </div>

                <div class="flex items-center justify-between gap-4 text-xs text-muted">
                    <span class="flex items-center gap-4">
                        <span
                            v-if="dueLabel(task)"
                            class="flex items-center gap-1"
                            :class="isOverdue(task) ? 'text-error font-medium' : ''"
                        >
                            <UIcon
                                name="i-lucide-calendar"
                                class="w-3.5 h-3.5"
                            />
                            {{ dueLabel(task) }}
                        </span>

                        <span
                            v-if="task.commentsCount"
                            class="flex items-center gap-1"
                        >
                            <UIcon
                                name="i-lucide-message-circle"
                                class="w-3.5 h-3.5"
                            />
                            {{ task.commentsCount }}
                        </span>
                        <span
                            v-if="task.attachmentsCount"
                            class="flex items-center gap-1"
                        >
                            <UIcon
                                name="i-lucide-paperclip"
                                class="w-3.5 h-3.5"
                            />
                            {{ task.attachmentsCount }}
                        </span>

                        <span
                            v-if="task.loggedMs"
                            class="flex items-center gap-1"
                        >
                            <UIcon
                                name="i-lucide-timer"
                                class="w-3.5 h-3.5"
                            />
                            {{ formatDuration(task.loggedMs) }} logged
                        </span>
                    </span>

                    <span class="flex items-center gap-2">
                        <UAvatar
                            :src="task.executor?.image || ''"
                            :alt="task.executor?.name || ''"
                            size="2xs"
                        />
                        {{ task.executor?.name || '—' }}
                    </span>
                </div>
            </UPageCard>
        </template>
    </div>
</template>
