<script setup lang="ts">
import { format, differenceInCalendarDays } from 'date-fns';
import { EProjectPriority, type IProjectDetail } from '#shared/types/projects';

const props = defineProps<{
    project: IProjectDetail;
}>();

const priorityColor = computed(() => {
    switch (props.project.priority) {
        case EProjectPriority.HIGH:
            return 'text-error';
        case EProjectPriority.MEDIUM:
            return 'text-warning';
        default:
            return 'text-muted';
    }
});

const daysLeft = computed(() => {
    if (!props.project.deadline) return null;

    return differenceInCalendarDays(new Date(props.project.deadline), new Date());
});

function formatDate(value: Date | string | null) {
    return value ? format(new Date(value), 'dd MMM yyyy') : '—';
}
</script>

<template>
    <BlockWrapper title="Project Information">
        <dl class="grid gap-3 text-sm p-4 pt-2">
            <div class="flex items-center justify-between gap-2">
                <dt class="text-muted">Status</dt>
                <dd>
                    <UBadge
                        :color="project.isClosed ? 'neutral' : 'success'"
                        variant="subtle"
                    >
                        {{ project.isClosed ? 'Closed' : 'In Progress' }}
                    </UBadge>
                </dd>
            </div>

            <div class="flex items-center justify-between gap-2">
                <dt class="text-muted">Priority</dt>
                <dd
                    class="font-medium capitalize"
                    :class="priorityColor"
                >
                    {{ projectPriorityLabel(project.priority).toLowerCase() || '—' }}
                </dd>
            </div>

            <div class="flex items-center justify-between gap-2">
                <dt class="text-muted">Client</dt>
                <dd class="font-medium">{{ project.client || '—' }}</dd>
            </div>

            <div class="flex items-center justify-between gap-2">
                <dt class="text-muted">Start Date</dt>
                <dd class="font-medium">{{ formatDate(project.startDate) }}</dd>
            </div>

            <div class="flex items-center justify-between gap-2">
                <dt class="text-muted">Deadline</dt>
                <dd class="font-medium">{{ formatDate(project.deadline) }}</dd>
            </div>

            <div
                v-if="daysLeft !== null"
                class="flex items-center justify-between gap-2"
            >
                <dt class="text-muted">Days Left</dt>
                <dd
                    class="font-medium"
                    :class="daysLeft < 0 ? 'text-error' : ''"
                >
                    {{ daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days` }}
                </dd>
            </div>

            <div
                v-if="project.budget"
                class="flex items-center justify-between gap-2"
            >
                <dt class="text-muted">Budget</dt>
                <dd class="font-medium">${{ project.budget.toLocaleString('en-US') }}</dd>
            </div>
        </dl>
    </BlockWrapper>
</template>
