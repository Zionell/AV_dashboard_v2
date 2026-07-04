<script setup lang="ts">
import type { DateRange } from 'reka-ui';
import { DateFormatter, CalendarDate, today } from '@internationalized/date';
import type { Range } from '#shared/types/times';
import { rangesList } from '~/assets/ts/constants';

const emit = defineEmits<{
    change: [value: Range];
}>();

const df = new DateFormatter('en-US', {
    dateStyle: 'medium',
});

const selected = defineModel<Range>({ required: true });

const calendarRange = computed(() => ({
    start: selected.value.start ? toCalendarDate(selected.value.start) : undefined,
    end: selected.value.end ? toCalendarDate(selected.value.end) : undefined,
}));

function toCalendarDate(date: Date) {
    return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

function updateDate(event: DateRange | null) {
    if (!event) {
        return;
    }
    const { start, end } = event;

    if (start && end) {
        const startDate: Date = new Date(start.year, start.month - 1, start.day);
        const endDate: Date = new Date(end.year, end.month - 1, end.day);

        emit('change', {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
        });
    }
}

function isRangeSelected(range: { days?: number; months?: number; years?: number }) {
    if (!selected.value.start || !selected.value.end) return false;
    //
    // const currentDate = today(new Date().toISOString());
    // let startDate = currentDate.copy();
    //
    // if (range.days) {
    //     startDate = startDate.subtract({ days: range.days });
    // } else if (range.months) {
    //     startDate = startDate.subtract({ months: range.months });
    // } else if (range.years) {
    //     startDate = startDate.subtract({ years: range.years });
    // }
    //
    // const selectedStart = toCalendarDate(selected.value.start);
    // const selectedEnd = toCalendarDate(selected.value.end);
    //
    return true;
    // return selectedStart.compare(startDate) === 0 && selectedEnd.compare(currentDate) === 0;
}

function selectRange(range: { days?: number; months?: number; years?: number }) {
    // const endDate = today(new Date().toISOString());
    // let startDate = endDate.copy();
    //
    // if (range.days) {
    //     startDate = startDate.subtract({ days: range.days });
    // } else if (range.months) {
    //     startDate = startDate.subtract({ months: range.months });
    // } else if (range.years) {
    //     startDate = startDate.subtract({ years: range.years });
    // }
    //
    // selected.value = {
    //     start: startDate.toDate(new Date().toISOString()),
    //     end: endDate.toDate(new Date().toISOString()),
    // };
}
</script>

<template>
    <UPopover
        :content="{ align: 'start' }"
        :modal="true"
    >
        <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-calendar"
            class="data-[state=open]:bg-elevated group"
        >
            <span class="truncate">
                <template v-if="selected?.start">
                    <template v-if="selected?.end">
                        {{ df.format(selected.start) }} - {{ df.format(selected.end) }}
                    </template>
                    <template v-else>
                        {{ df.format(selected.start) }}
                    </template>
                </template>
                <template v-else> Pick a date </template>
            </span>

            <template #trailing>
                <UIcon
                    name="i-lucide-chevron-down"
                    class="shrink-0 text-dimmed size-5 group-data-[state=open]:rotate-180 transition-transform duration-200"
                />
            </template>
        </UButton>

        <template #content>
            <div class="flex items-stretch sm:divide-x divide-default">
                <!--                <div class="hidden sm:flex flex-col justify-center">-->
                <!--                    <UButton-->
                <!--                        v-for="(range, index) in rangesList"-->
                <!--                        :key="index"-->
                <!--                        :label="range.label"-->
                <!--                        color="neutral"-->
                <!--                        variant="ghost"-->
                <!--                        class="rounded-none px-4"-->
                <!--                        :class="[isRangeSelected(range) ? 'bg-elevated' : 'hover:bg-elevated/50']"-->
                <!--                        truncate-->
                <!--                        @click="selectRange(range)"-->
                <!--                    />-->
                <!--                </div>-->

                <UCalendar
                    :model-value="calendarRange"
                    class="p-2"
                    :number-of-months="2"
                    range
                    @update:modelValue="updateDate"
                />
            </div>
        </template>
    </UPopover>
</template>
