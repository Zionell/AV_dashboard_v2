<script setup lang="ts">
const props = defineProps<{
    card: {
        label: string;
        icon: string;
        value: string;
        caption: string;
    };
}>();
</script>

<template>
    <UPageCard
        variant="subtle"
        :ui="{ container: 'p-4 sm:p-4' }"
    >
        <div class="flex items-center gap-2 text-muted text-sm">
            <UIcon
                :name="props.card.icon"
                class="w-4 h-4"
            />
            {{ props.card.label }}
        </div>
        <p
            v-if="props.card?.value"
            class="text-2xl font-bold"
        >
            {{ props.card.value }}
        </p>
        <p
            v-if="props.card?.caption"
            class="text-xs text-muted"
        >
            {{ props.card.caption }}
        </p>
    </UPageCard>
</template>
