<script setup lang="ts">
const timeStore = useTimesStore();
</script>

<template>
    <UCard variant="subtle">
        <div class="flex items-center justify-between gap-4 min-w-52">
            <transition
                name="rotate"
                mode="out-in"
            >
                <div :key="`title_${timeStore.isActive}`">
                    {{ timeStore.isActive ? 'End session' : 'Start session' }}
                </div>
            </transition>

            <UButton
                size="xl"
                square
                :loading="timeStore.isLoading"
                @click="timeStore.changeSessionStatus"
            >
                <transition
                    name="rotate"
                    mode="out-in"
                >
                    <UIcon
                        v-if="timeStore.isActive"
                        name="i-local-stop"
                        class="h-auto w-3/5 mx-auto relative z-10"
                    />
                    <UIcon
                        v-else
                        name="i-local-play"
                        class="h-auto w-3/5 mx-auto relative z-10"
                    />
                </transition>
            </UButton>
        </div>
    </UCard>
</template>
