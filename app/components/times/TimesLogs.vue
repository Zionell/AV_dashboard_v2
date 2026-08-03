<script setup lang="ts">
import { format } from 'date-fns';
import type { ETodoStatus, type ITimeLog } from '#shared/types/times';
import { h, resolveComponent } from 'vue';
import type { TableColumn } from '@nuxt/ui';
import { getTodoColor } from '#server/utils/common';

const props = defineProps<{
    logs: ITimeLog[];
    selectedUserId: string;
}>();

const UBadge = resolveComponent('UBadge');

interface ILogFormatted {
    time: string;
    project: string;
    task: string;
    duration: string;
    status: ETodoStatus;
}

const logsFormatted = computed((): ILogFormatted[] => {
    return props.logs.map((log) => ({
        time: timeRange(log),
        project: log.projectName || '—',
        task: log.todoName || '—',
        duration: log.active ? 'ongoing' : formatDuration(log.durationMs),
        status: log.todoStatus,
    }));
});

const columns: TableColumn<ILogFormatted>[] = [
    {
        accessorKey: 'time',
        header: 'Time',
    },
    {
        accessorKey: 'project',
        header: 'Project',
    },
    {
        accessorKey: 'task',
        header: 'Task',
    },
    {
        accessorKey: 'duration',
        header: 'Duration',
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue('status') as ETodoStatus;

            const color = getTodoColor(status);

            return h(
                UBadge,
                {
                    class: 'capitalize',
                    variant: 'subtle',
                    color,
                },
                () => row.getValue('status')
            );
        },
    },
];

function timeRange(log: ITimeLog) {
    return `${format(new Date(log.start), 'HH:mm')} – ${log.active ? '…' : format(new Date(log.end), 'HH:mm')}`;
}
</script>

<template>
    <BlockWrapper
        title="Time Logs"
        :is-empty="!props.logs.length"
    >
        <UTable
            :data="logsFormatted"
            :columns="columns"
            class="flex-1"
        />
    </BlockWrapper>
</template>
