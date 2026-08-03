<script setup lang="ts">
import { LOGIN_CONTENT } from '~/assets/ts/constants';
import * as z from 'zod';
import type { FormSubmitEvent, AuthFormField, ButtonProps } from '@nuxt/ui';

definePageMeta({
    layout: 'auth',
});

const { signIn } = useAuth();
const { $csrfFetch } = useNuxtApp();
const userStore = useUserStore();
const route = useRoute();

const isLoading = ref<boolean>(false);
const errorMsg = ref<string>('');

// Пришли по ссылке из письма-приглашения — примем его сразу после входа.
const inviteToken = computed(() => route.query.token?.toString() || '');

const fields: AuthFormField[] = [
    {
        name: 'email',
        type: 'email',
        label: 'Email',
        placeholder: 'Enter your email',
        required: true,
    },
    {
        name: 'password',
        label: 'Password',
        type: 'password',
        placeholder: 'Enter your password',
        required: true,
    },
];

const providers: ButtonProps[] = [
    {
        label: 'Google',
        icon: 'i-simple-icons-google',
        onClick: () => signIn('google'),
    },
];

const schema = z.object({
    email: z.email('Invalid email'),
    password: z.string('Password is required').min(6, 'Must be at least 6 characters'),
});

type Schema = z.output<typeof schema>;

async function onSubmit(payload: FormSubmitEvent<Schema>) {
    try {
        isLoading.value = true;
        errorMsg.value = '';

        const res = await $csrfFetch<{ onboarded: boolean }>('/api/auth/login', {
            method: 'POST',
            body: payload.data,
        });

        // С приглашением компания берётся из него — своя не создаётся, онбординг не нужен.
        if (inviteToken.value && !res.onboarded) {
            await $csrfFetch('/api/auth/accept-invite', {
                method: 'POST',
                body: { token: inviteToken.value },
            });

            await userStore.fetchUser();
            await navigateTo(ERoutes.DASHBOARD);

            return;
        }

        await userStore.fetchUser();
        await navigateTo(res.onboarded ? ERoutes.DASHBOARD : ERoutes.LOGIN_NEW);
    } catch (e) {
        errorMsg.value = (e as { data?: { message?: string } })?.data?.message || 'Failed to sign in';
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
    <UDashboardPanel id="auth">
        <section class="grid grid-cols-[2fr_1.5fr] place-items-center gap-16 min-h-screen p-12">
            <NuxtImg
                class="h-full object-contain"
                src="/images/auth-image.png"
                placeholder
                alt="Picture"
                loading="lazy"
            />

            <UPageCard class="w-full max-w-md">
                <UAuthForm
                    :schema="schema"
                    :title="LOGIN_CONTENT.title"
                    icon="i-lucide-user"
                    :fields="fields"
                    :providers="providers"
                    :loading="isLoading"
                    @submit="onSubmit"
                >
                    <template #footer>
                        <p
                            v-if="errorMsg"
                            class="text-sm text-error"
                        >
                            {{ errorMsg }}
                        </p>
                    </template>
                </UAuthForm>
            </UPageCard>
        </section>
    </UDashboardPanel>
</template>
