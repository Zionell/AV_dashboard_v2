<script setup lang="ts">
import * as z from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';

const { $csrfFetch } = useNuxtApp();
const userStore = useUserStore();
const toast = useToast();
const emit = defineEmits(['refresh']);

const schema = z.object({
    name: z.string(),
});

type Schema = z.output<typeof schema>;
const state = reactive({
    name: undefined,
});
const isLoading = ref<boolean>(false);
const isOpen = ref<boolean>(false);

async function onSubmit(event: FormSubmitEvent<Schema>) {
    try {
        isLoading.value = true;

        await $csrfFetch('/api/company', {
            method: 'POST',
            body: {
                ...event.data,
                userId: userStore.user?.id || '',
            },
        });
        await userStore.fetchUser();

        emit('refresh');
        toast.add({
            title: 'Success',
            description: 'Your company have been created.',
            icon: 'i-lucide-check',
            color: 'success',
        });
    } catch (e) {
        console.warn('AssNewCompany / onSubmit: ', e);
    } finally {
        isLoading.value = false;
        isOpen.value = false;
    }
}
</script>

<template>
    <UModal
        v-model:open="isOpen"
        title="New company"
    >
        <UButton
            label="Add new company"
            size="lg"
        />

        <template #body>
            <UForm
                :schema="schema"
                :state="state"
                class="space-y-4"
                @submit="onSubmit"
            >
                <UFormField
                    label="Name"
                    name="name"
                >
                    <UInput
                        v-model="state.name"
                        class="w-full"
                    />
                </UFormField>

                <div class="grid grid-cols-2 gap-2">
                    <UButton
                        label="Cancel"
                        size="lg"
                        variant="outline"
                        block
                        :loading="isLoading"
                        @click="isOpen = false"
                    />
                    <UButton
                        label="Save"
                        size="lg"
                        block
                        :loading="isLoading"
                        type="submit"
                    />
                </div>
            </UForm>
        </template>
    </UModal>
</template>
