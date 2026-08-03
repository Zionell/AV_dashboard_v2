<script setup lang="ts">
import * as z from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import { ECompanyPlan, COMPANY_PLANS } from '#shared/types/company';
import { planSummary } from '#shared/utils/format';

definePageMeta({
    layout: 'auth',
});

const planOptions = Object.values(ECompanyPlan).map((plan) => ({
    value: plan,
    ...COMPANY_PLANS[plan],
}));

const { $csrfFetch } = useNuxtApp();
const userStore = useUserStore();

const schema = z.object({
    name: z.string('Name is required').trim().min(1, 'Name is required'),
    companyName: z.string('Company name is required').trim().min(1, 'Company name is required'),
    phone: z.string().optional(),
    plan: z.enum(ECompanyPlan),
});

type Schema = z.output<typeof schema>;

const state = reactive({
    name: userStore.user?.name || '',
    companyName: '',
    phone: '',
    plan: ECompanyPlan.FREE,
});

const isLoading = ref<boolean>(false);
const errorMsg = ref<string>('');

async function onSubmit(event: FormSubmitEvent<Schema>) {
    try {
        isLoading.value = true;
        errorMsg.value = '';

        await $csrfFetch('/api/auth/onboarding', {
            method: 'POST',
            body: event.data,
        });

        await userStore.fetchUser();
        await navigateTo(ERoutes.DASHBOARD);
    } catch (e) {
        errorMsg.value = (e as { data?: { message?: string } })?.data?.message || 'Failed to save';
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
    <UDashboardPanel id="onboarding">
        <section class="grid place-items-center min-h-screen p-12">
            <UPageCard class="w-full max-w-md">
                <div class="grid gap-6">
                    <div>
                        <h1 class="text-2xl font-semibold">Tell us about yourself</h1>
                        <p class="text-sm text-muted">This helps us set up your dashboard.</p>
                    </div>

                    <UForm
                        :schema="schema"
                        :state="state"
                        class="space-y-4"
                        @submit="onSubmit"
                    >
                        <UFormField
                            required
                            label="Name"
                            name="name"
                        >
                            <UInput
                                v-model="state.name"
                                class="w-full"
                                size="lg"
                            />
                        </UFormField>

                        <UFormField
                            required
                            label="Company name"
                            name="companyName"
                        >
                            <UInput
                                v-model="state.companyName"
                                class="w-full"
                                size="lg"
                            />
                        </UFormField>

                        <UFormField
                            label="Phone"
                            name="phone"
                        >
                            <UInput
                                v-model="state.phone"
                                class="w-full"
                                size="lg"
                            />
                        </UFormField>

                        <UFormField
                            required
                            label="Plan"
                            name="plan"
                        >
                            <div class="grid gap-2">
                                <button
                                    v-for="option in planOptions"
                                    :key="option.value"
                                    type="button"
                                    class="flex items-center justify-between gap-3 rounded-lg border p-3 text-left transition"
                                    :class="
                                        state.plan === option.value
                                            ? 'border-primary bg-primary/10'
                                            : 'border-default hover:bg-elevated/50'
                                    "
                                    @click="state.plan = option.value"
                                >
                                    <span class="text-sm font-medium">{{ option.label }}</span>
                                    <span class="text-xs text-muted">{{ planSummary(option) }}</span>
                                </button>
                            </div>
                        </UFormField>

                        <transition
                            name="swipe"
                            mode="out-in"
                        >
                            <p
                                v-if="errorMsg"
                                class="text-sm text-error"
                            >
                                {{ errorMsg }}
                            </p>
                        </transition>

                        <UButton
                            size="lg"
                            block
                            type="submit"
                            :loading="isLoading"
                        >
                            Continue
                        </UButton>
                    </UForm>
                </div>
            </UPageCard>
        </section>
    </UDashboardPanel>
</template>
