<script setup lang="ts">
import type { IMaterial } from '#shared/types/material';

interface IProps {
    items: IMaterial[];
}

const props = defineProps<IProps>();

const { data: categories } = await useLazyFetch('/api/materials/categories', {
    default: () => [],
});

const categoryItems = computed(() => [
    { label: 'All', value: undefined },
    ...(categories.value || []).map((c) => ({ label: c.label, value: c.id })),
]);

const categoryId = defineModel<string | undefined>('categoryId');

const open = (link: string) => {
    window.open(link, '_blank');
};
</script>

<template>
    <BlockWrapper
        title="Materials"
        :is-empty="!props.items.length"
    >
        <div class="p-4">
            <USelect
                v-model="categoryId"
                :items="categoryItems"
                placeholder="Type: All"
                class="min-w-32"
            />

            <ul
                v-if="items.length"
                class="h-56 mt-4 custom__scroll"
            >
                <li
                    v-for="material in props.items"
                    :key="material.id"
                    class="flex items-center justify-between rounded-xl gap-5 p-2 mb-4 border border-orange-300 hover:border-orange-700 ease-linear duration-150 cursor-pointer"
                    @click="open(material.sourceLink)"
                >
                    <div class="w-5 h-5 rounded-full" />
                    <div class="grow">
                        {{ material.name }}
                    </div>
                </li>
            </ul>
        </div>
    </BlockWrapper>
</template>
