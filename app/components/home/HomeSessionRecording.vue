<script setup lang="ts">
const timeStore = useTimesStore();
</script>

<template>
    <BlockWrapper title="Session time">
        <div class="flex items-center justify-between gap-2.5 mt-auto">
            <div class="font-medium text-3xl">
                {{ timeStore.time.hour }}:{{ timeStore.time.min }}:{{ timeStore.time.sec }}
            </div>

            <div class="flex items-center justify-center p-3 rounded-2xl bg-orange-100 dark:bg-orange-50">
                <ClockSvg :session-status="timeStore.isActive" />
            </div>
        </div>
    </BlockWrapper>
</template>
