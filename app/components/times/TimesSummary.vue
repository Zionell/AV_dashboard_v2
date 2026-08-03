<script setup lang="ts">
import type { ITeamSummaryRow } from '#shared/types/times';
import { h, resolveComponent } from 'vue';
import type { TableColumn } from '@nuxt/ui';

const props = defineProps<{
    team: ITeamSummaryRow[];
}>();

const UAvatar = resolveComponent('UAvatar');

interface IItemFormatted {
    employee: string;
    avatar: string;
    today: number | string;
    week: number | string;
    month: number | string;
    ot: number | string;
}

const dataFormatted = computed((): IItemFormatted[] => {
    return props.team.map((item) => ({
        employee: item.name || '',
        avatar: item.image || '',
        today: formatDuration(item.todayMs) || '—',
        week: formatDuration(item.weekMs) || '—',
        month: formatDuration(item.monthMs) || '—',
        ot: item.overtimeMs > 0 ? `+${formatDuration(item.overtimeMs)}` : '—',
    }));
});

const columns: TableColumn<IItemFormatted>[] = [
    {
        accessorKey: 'employee',
        header: 'Employee',
        cell: ({ row }) => {
            return h('div', { class: 'flex items-center gap-2 min-w-0' }, [
                h(UAvatar, {
                    alt: row.original.employee || '',
                    src: row.original.avatar,
                    loading: 'lazy',
                    size: '2xs',
                }),
                h('div', undefined, [h('span', { class: 'truncate' }, row.original.employee)]),
            ]);
        },
    },
    {
        accessorKey: 'today',
        header: 'Today',
    },
    {
        accessorKey: 'week',
        header: 'Week',
    },
    {
        accessorKey: 'month',
        header: 'Month',
    },
    {
        accessorKey: 'ot',
        header: 'OT',
    },
];
</script>

<template>
    <BlockWrapper
        title="Team Summary"
        :is-empty="!props.team.length"
    >
        <div class="overflow-hidden w-auto">
            <UTable
                :data="dataFormatted"
                :columns="columns"
                class="flex-1 overflow-auto"
            />
        </div>
    </BlockWrapper>
</template>
