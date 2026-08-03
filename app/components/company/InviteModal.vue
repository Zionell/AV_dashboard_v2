<script setup lang="ts">
import * as z from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import { WORK_DAY_HOURS } from '#shared/constants';

const { $csrfFetch } = useNuxtApp();
const toast = useToast();

const isOpen = ref(false);
const isLoading = ref(false);
const errorMsg = ref('');

const schema = z.object({
    email: z.email('Invalid email'),
    workHours: z.number('Work hours are required').int().min(1, 'At least 1 hour').max(24, 'At most 24 hours'),
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({ workHours: WORK_DAY_HOURS });

function close() {
    isOpen.value = false;
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
    try {
        isLoading.value = true;
        errorMsg.value = '';

        await $csrfFetch('/api/company/invite', {
            method: 'POST',
            body: { email: event.data.email, workHours: event.data.workHours },
        });

        toast.add({
            title: 'Invitation sent',
            description: `The email to ${event.data.email} is on its way.`,
            color: 'success',
        });
        state.email = '';
        isOpen.value = false;
    } catch (e) {
        errorMsg.value = (e as { data?: { message?: string } })?.data?.message || 'Failed to send invitation';
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
    <UModal
        v-model:open="isOpen"
        title="Invite people"
        description="Invite a colleague to your company by email."
    >
        <UButton
            icon="i-lucide-user-plus"
            label="Invite people"
        />

        <template #body>
            <UForm
                :schema="schema"
                :state="state"
                class="grid gap-4"
                @submit="onSubmit"
            >
                <UFormField
                    required
                    label="Email"
                    name="email"
                >
                    <UInput
                        v-model="state.email"
                        type="email"
                        placeholder="colleague@example.com"
                        class="w-full"
                    />
                </UFormField>

                <UFormField
                    required
                    label="Work hours per day"
                    name="workHours"
                    description="Used as this person's daily norm when calculating overtime."
                >
                    <UInputNumber
                        v-model="state.workHours"
                        :min="1"
                        :max="24"
                        class="w-full"
                    />
                </UFormField>

                <!-- Отправка замокана: письмо только логируется на сервере. Розовый маркер, не убирать без реализации. -->
                <p class="text-xs text-muted border-2 border-pink-500 rounded px-2 py-1">
                    Mock: no email is sent, the text is logged to the server console.
                </p>

                <p
                    v-if="errorMsg"
                    class="text-sm text-error"
                >
                    {{ errorMsg }}
                </p>

                <div class="flex justify-end gap-3">
                    <UButton
                        label="Cancel"
                        variant="ghost"
                        color="neutral"
                        @click="close"
                    />
                    <UButton
                        type="submit"
                        label="Send invite"
                        icon="i-lucide-send"
                        :loading="isLoading"
                    />
                </div>
            </UForm>
        </template>
    </UModal>
</template>
