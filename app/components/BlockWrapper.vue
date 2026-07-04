<script setup lang="ts">
defineProps({
    title: {
        type: String,
        default: '',
    },

    isLoading: {
        type: Boolean,
        default: false,
    },

    isEmpty: {
        type: Boolean,
        default: false,
    },

    isShowTooltip: {
        type: Boolean,
        default: false,
    },
});
</script>

<template>
    <UCard variant="subtle">
        <template #header>
            <div
                v-if="title"
                class="flex items-center justify-between"
            >
                <h3 class="text-xl font-medium">
                    {{ title }}
                </h3>

                <UPopover v-if="isShowTooltip">
                    <UButton
                        size="sm"
                        square
                        variant="soft"
                        icon="i-local-tooltip"
                    />

                    <template #content>
                        <div class="p-4">test</div>
                    </template>
                </UPopover>
            </div>
        </template>

        <div class="flex flex-col grow">
            <transition
                name="fade"
                mode="out-in"
            >
                <Preloader v-if="isLoading" />
                <UEmpty
                    v-else-if="isEmpty"
                    variant="naked"
                    title="Oops... It looks like there's nothing here."
                />
                <div v-else>
                    <slot />
                </div>
            </transition>
        </div>
    </UCard>
</template>
