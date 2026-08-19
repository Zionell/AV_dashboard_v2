import { defineStore } from 'pinia';
import { onMounted } from 'vue';
import type { Times } from '~~/prisma/generated/prisma/client';

const defaultTime = {
    hour: '00',
    min: '00',
    sec: '00',
};

export const useTimesStore = defineStore('times', () => {
    const activeTimers = ref<Times[]>([]);
    const isLoading = ref(false);
    const time = ref(JSON.parse(JSON.stringify(defaultTime)));

    const { pause, resume, isActive } = useIntervalFn(
        () => {
            const startedAt = activeTime.value ? new Date(activeTime.value.createdAt).getTime() : 0;

            if (startedAt) {
                const diff = Math.floor(Date.now() / 1000) - startedAt / 1000;

                const hours = Math.floor(diff / 3600);
                const minutes = Math.floor((diff % 3600) / 60);
                const seconds = Math.floor(diff % 60);

                time.value.hour = String(hours).padStart(2, '0');
                time.value.min = String(minutes).padStart(2, '0');
                time.value.sec = String(seconds).padStart(2, '0');
            }
        },
        1000,
        {
            immediate: false,
        }
    );

    const activeTime = computed(() => activeTimers.value[0] || null);

    onMounted(async () => {
        await fetchActiveTimers();
    });

    function startTimer() {
        if (activeTime.value) {
            resume();
        }
    }

    async function changeSessionStatus(context?: { projectId?: string; todoId?: string }) {
        if (!isActive.value) {
            await createActiveTimer(context);
        } else {
            await handleSave();
        }
    }

    async function fetchActiveTimers() {
        try {
            const { $csrfFetch } = useNuxtApp();

            const timers = await $csrfFetch('/api/times/active');

            if (timers?.length) {
                activeTimers.value = timers;

                startTimer();
            }
        } catch (error) {
            console.error('useTimer / fetchActiveTimers: ', error);
        }
    }

    async function createActiveTimer(context?: { projectId?: string; todoId?: string }) {
        try {
            isLoading.value = true;
            const { $csrfFetch } = useNuxtApp();

            const res = await $csrfFetch('/api/times', {
                method: 'POST',
                body: {
                    projectId: context?.projectId || undefined,
                    todoId: context?.todoId || undefined,
                },
            });

            if (res) {
                activeTimers.value.push(res);

                startTimer();
            }
        } catch (error) {
            console.error('useTimer / createActiveTimer: ', error);
        } finally {
            isLoading.value = false;
        }
    }

    async function handleSave() {
        try {
            isLoading.value = true;
            pause();

            const { $csrfFetch } = useNuxtApp();

            await $csrfFetch(`/api/times/${activeTime.value?.id}/`, {
                method: 'PATCH',
                body: {},
            });

            // Без очистки следующая сессия попадёт в массив вторым элементом, а
            // activeTime (это [0]) продолжит указывать на уже закрытую — и таймер
            // будет считать от её начала.
            activeTimers.value = [];
            time.value = JSON.parse(JSON.stringify(defaultTime));
        } catch (error) {
            console.error('useTimer / handleSave: ', error);
        } finally {
            isLoading.value = false;
        }
    }

    return {
        isLoading,
        isActive,
        time,
        activeTime,
        changeSessionStatus,
    };
});
