<script setup lang="ts">
import * as z from 'zod';
import { toBase64 } from '~/assets/ts/files';

const { $csrfFetch } = useNuxtApp();
const userStore = useUserStore();
const toast = useToast();
const { readonlyAttrs } = useReadonly();
const fileRef = useTemplateRef<HTMLInputElement>('fileRef');
const isLoading = ref(false);

const profileSchema = z.object({
    name: z.string().min(2, 'Too short'),
    email: z.string().email('Invalid email'),
    image: z.string().optional(),
    bio: z.string().optional(),
});

type ProfileSchema = z.output<typeof profileSchema>;

const profile = reactive<Partial<ProfileSchema>>({
    name: userStore.user?.name || '',
    email: userStore.user?.email || '',
    image: userStore.user?.image || '',
    bio: userStore.user?.bio || '',
});

async function onSubmit() {
    try {
        isLoading.value = true;

        const res = await $csrfFetch('/api/users', {
            method: 'PATCH',
            body: {
                ...profile,
                id: userStore.user?.id,
            },
        });
        userStore.updateUser(res);

        toast.add({
            title: 'Success',
            description: 'Your settings have been updated.',
            icon: 'i-lucide-check',
            color: 'success',
        });
    } catch (e) {
        console.warn('settings/ onSubmit: ', e);
    } finally {
        isLoading.value = false;
    }
}

async function onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;

    if (!input.files?.length) {
        return;
    }

    profile.image = await toBase64(input.files[0]!);
}

function onFileClick() {
    fileRef.value?.click();
}
</script>

<template>
    <UForm
        id="settings"
        class="w-full"
        :schema="profileSchema"
        :state="profile"
        @submit="onSubmit"
    >
        <UPageCard
            title="Profile"
            variant="naked"
            orientation="horizontal"
            class="mb-4"
        >
            <UButton
                v-bind="readonlyAttrs"
                form="settings"
                label="Save changes"
                :loading="isLoading"
                type="submit"
                variant="outline"
                class="w-fit lg:ms-auto"
            />
        </UPageCard>

        <UPageCard variant="subtle">
            <UFormField
                name="name"
                label="Name"
                required
                class="flex justify-between sm:items-center gap-4"
            >
                <UInput
                    v-model="profile.name"
                    autocomplete="off"
                    class="w-full grow"
                    size="lg"
                />
            </UFormField>
            <USeparator />

            <UFormField
                name="email"
                label="Email"
                required
                class="flex justify-between sm:items-center gap-4"
            >
                <UInput
                    v-model="profile.email"
                    type="email"
                    autocomplete="off"
                    class="w-full grow"
                    size="lg"
                />
            </UFormField>
            <USeparator />

            <UFormField
                name="image"
                label="Image"
                class="flex max-sm:flex-col justify-between sm:items-center gap-4"
            >
                <div class="flex flex-wrap items-center gap-3">
                    <UAvatar
                        :src="profile.image"
                        :alt="profile.name"
                        size="lg"
                    />
                    <UButton
                        v-bind="readonlyAttrs"
                        label="Choose"
                        variant="outline"
                        @click="onFileClick"
                    />
                    <input
                        ref="fileRef"
                        type="file"
                        class="hidden"
                        accept=".jpg, .jpeg, .png, .gif"
                        @change="onFileChange"
                    />
                </div>
            </UFormField>
            <USeparator />

            <UFormField
                name="bio"
                label="Bio"
                :ui="{ container: 'w-full' }"
                class="flex justify-between gap-4"
            >
                <UTextarea
                    v-model="profile.bio"
                    :rows="5"
                    autoresize
                    class="w-full"
                />
            </UFormField>
        </UPageCard>
    </UForm>
</template>
