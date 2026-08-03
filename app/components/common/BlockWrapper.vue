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
    <UPageCard
        :title="title"
        variant="subtle"
        :ui="{
            container: 'p-0 sm:p-0 gap-y-2',
            title: 'p-4 pb-0',
        }"
    >
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
    </UPageCard>
</template>
