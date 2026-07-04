<script setup lang="ts">
import { sub } from 'date-fns';
import type { Period, Range } from '#shared/types/times';

const userStore = useUserStore();

const range = shallowRef<Range>({
    start: sub(new Date(), { days: 14 }),
    end: new Date(),
});
const period = ref<Period>('daily');

const { data, refresh } = await useFetch('/api/times', {
    query: {
        userId: userStore.user?.id,
        range: range,
    },
});

async function handleChangeDate(dates: Range) {
    console.log('dates', dates);
    range.value = dates;
}

// type ChartDataType = {
//     labels: string[];
//     values: number[];
// };
//
// const curMonth = ref(new Date().getMonth() + 1);
// const daysInMonth = computed(() => daysArrayByCurMonth(curMonth.value));
//
// const userStore = useUserStore();
// const { data, pending, refresh } = await useAsyncData(
//     async () =>
//         await $fetch('/api/times', {
//             query: {
//                 userId: userStore.getUserId,
//                 month: curMonth.value,
//             },
//         })
// );
//
// const preparedData = computed<ChartDataType>(() => {
//     const initialState: ChartDataType = {
//         labels: [],
//         values: [],
//     };
//     daysInMonth.value.forEach((d) => {
//         const item = data?.value?.find((v: TimeType) => v.date === d);
//         if (item) {
//             const time = item._sum.times ? item._sum.times : 0;
//             initialState.values.push(time);
//             initialState.labels.push(item.date);
//         } else {
//             initialState.values.push(0);
//             initialState.labels.push('');
//         }
//     });
//     return initialState;
// });
// const isEmpty = computed(() => !preparedData.value);
//
// const handleChange = () => {
//     refresh();
// };
</script>

<template>
    <UDashboardPanel
        id="timeshhet"
        :ui="{ body: 'lg:py-12' }"
    >
        <template #header>
            <UDashboardNavbar title="Times" />

            <UDashboardToolbar class="py-6">
                <template #left>
                    <CurrentDate />
                </template>

                <template #right>
                    <DateRangePicker
                        v-model="range"
                        class="-ms-1"
                        @change="handleChangeDate"
                    />

                    <PeriodSelect
                        v-model="period"
                        :range="range"
                    />
                </template>
            </UDashboardToolbar>
        </template>

        <template #body>
            <section class="grid gap-8">
                range-{{ range }}
                <!--                <Chart-->
                <!--                    :period="period"-->
                <!--                    :range="range"-->
                <!--                />-->
                <br />
                <br />
                <br />
                {{ data }}
                <!--        <div class="flex items-center justify-between">-->
                <!--            <CurrentDate />-->
                <!--        </div>-->
                <!--        <div>-->
                <!--            <UFormGroup-->
                <!--                label="Диапазон дат"-->
                <!--                class="mb-6"-->
                <!--            >-->
                <!--                <USelect-->
                <!--                    v-model="curMonth"-->
                <!--                    :options="fullListMonth"-->
                <!--                    color="orange"-->
                <!--                    size="lg"-->
                <!--                    @change="handleChange"-->
                <!--                />-->
                <!--            </UFormGroup>-->

                <!--            <BlockWrapper-->
                <!--                title="График"-->
                <!--                :is-empty="isEmpty"-->
                <!--                :is-loading="pending"-->
                <!--            >-->
                <!--                <TimesheetChart-->
                <!--                    :prepared-data="preparedData"-->
                <!--                    :days-in-month="daysInMonth"-->
                <!--                />-->
                <!--            </BlockWrapper>-->
                <!--        </div>-->
            </section>
        </template>
    </UDashboardPanel>
</template>
