<script setup lang="ts">
import * as z from 'zod';
import type { FormError } from '@nuxt/ui';
import { capitalizeFirstLetter } from '~/assets/ts/text';

const { $csrfFetch } = useNuxtApp();
const userStore = useUserStore();
const toast = useToast();
const isLoading = ref(false);
const isDeleting = ref(false);

const fullPasswordSchema = z.object({
    current: z.string().min(8, 'Must be at least 8 characters'),
    new: z.string().min(8, 'Must be at least 8 characters'),
});
const passwordSchema = z.object({
    new: z.string().min(8, 'Must be at least 8 characters'),
});

const hasPassword = computed(() => userStore.user?.hasPassword);

const description = computed(() => {
    if (hasPassword.value) {
        return 'Confirm your current password before setting a new one.';
    }

    return 'Set password for your account. This will be used to log in to your account.';
});

// Полная схема как тип состояния: current опционален через Partial и не рендерится,
// когда пароль ещё не задан (в password кладём только new). Zod-схема для валидации
// по-прежнему выбирается динамически ниже.
type PasswordSchema = z.infer<typeof fullPasswordSchema>;

const schema = computed(() => (hasPassword.value ? fullPasswordSchema : passwordSchema));
const password = reactive<Partial<PasswordSchema>>(
    hasPassword.value
        ? {
              current: undefined,
              new: undefined,
          }
        : {
              new: undefined,
          }
);

function validate(state: Partial<PasswordSchema>): FormError[] {
    if (!hasPassword.value) {
        return [];
    }

    const errors: FormError[] = [];
    if (state.current && state.new && state.current === state.new) {
        errors.push({ name: 'new', message: 'Passwords must be different' });
    }
    return errors;
}

async function onSubmit() {
    try {
        isLoading.value = true;

        await $csrfFetch('/api/users/password', {
            method: 'PUT',
            body: {
                ...password,
                id: userStore.user?.id,
            },
        });

        toast.add({
            title: 'Success',
            description: 'Your password have been updated.',
            icon: 'i-lucide-check',
            color: 'success',
        });
    } catch (e) {
        console.warn('settings/ onSubmit: ', e);
    } finally {
        isLoading.value = false;
    }
}

async function handleDelete() {
    try {
        isDeleting.value = true;

        await $csrfFetch('/api/users/', {
            method: 'DELETE',
            query: {
                id: userStore.user?.id,
            },
        });

        window.location.href = ERoutes.INDEX;
    } catch (e) {
        console.warn('settings/ handleDelete: ', e);
    } finally {
        isDeleting.value = false;
    }
}
</script>

<template>
    <UPageCard
        title="Password"
        :description="description"
        variant="subtle"
    >
        <UForm
            :schema="schema"
            :state="password"
            :validate="validate"
            class="flex flex-col gap-4 max-w-xs"
            @submit="onSubmit"
        >
            <UFormField
                v-for="(val, key) in password"
                :key="key"
                :name="key"
            >
                <UInput
                    v-model="password[key]"
                    type="password"
                    :placeholder="`${capitalizeFirstLetter(key)} password`"
                    class="w-full"
                />
            </UFormField>

            <UButton
                label="Update"
                class="w-fit"
                type="submit"
                :loading="isLoading"
            />
        </UForm>
    </UPageCard>

    <UPageCard
        title="Account"
        description="No longer want to use our service? You can delete your account here. This action is not reversible. All information related to this account will be deleted permanently."
        class="bg-gradient-to-tl from-error/10 from-5% to-default"
    >
        <template #footer>
            <UButton
                label="Delete account"
                color="error"
                :loading="isDeleting"
                @click="handleDelete"
            />
        </template>
    </UPageCard>
</template>
