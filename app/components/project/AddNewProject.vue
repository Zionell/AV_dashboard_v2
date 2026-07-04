<script setup lang="ts">
import { z } from 'zod';
import { toBase64 } from '~/assets/ts/files';

const emit = defineEmits(['refresh']);

defineExpose({
    open: () => {
        isOpen.value = true;
    },
});

const { $csrfFetch } = useNuxtApp();
const userStore = useUserStore();
const toast = useToast();
const isLoading = ref(false);
const isOpen = ref<boolean>(false);
const image = ref(null);

const schema = z.object({
    name: z.string(),
    users: z.array(z.string()).optional(),
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
    name: undefined,
    users: [],
});

const { data: users, status } = await useLazyFetch('/api/users/projects', {
    query: {
        companyId: userStore.user?.companyId,
    },
    key: 'users',
});

async function onSubmit() {
    try {
        isLoading.value = true;

        const imageBase64 = image.value ? await toBase64(image.value!) : '';

        await $csrfFetch('/api/projects', {
            method: 'POST',
            body: {
                ...state,
                image: imageBase64,
                companyId: userStore.user?.companyId,
            },
        });

        emit('refresh');
        toast.add({
            title: 'Success',
            description: 'Your company have been created.',
            icon: 'i-lucide-check',
            color: 'success',
        });
    } catch (e) {
        console.warn('ProjectAddNew/ onSubmit: ', e);
    } finally {
        isLoading.value = false;
        isOpen.value = false;
    }
}
</script>

<template>
    <UModal
        v-model:open="isOpen"
        title="New project"
    >
        <UButton
            label="Create project"
            size="lg"
            @click="isOpen = true"
        />

        <template #body>
            <UForm
                :schema="schema"
                :state="state"
                class="space-y-4"
                @submit="onSubmit"
            >
                <UFormField
                    name="name"
                    label="Name"
                    required
                >
                    <UInput
                        v-model="state.name"
                        autocomplete="off"
                        class="w-full"
                        size="lg"
                    />
                </UFormField>
                <USeparator />

                <UFormField
                    label="Participants"
                    name="users"
                >
                    <USelectMenu
                        v-model="state.users"
                        :loading="status === 'pending'"
                        :items="users"
                        class="w-full"
                        multiple
                        virtualize
                        value-key="id"
                    >
                        <template #item-label="{ item }">
                            {{ item.name }}

                            <span class="text-muted">
                                {{ item.role }}
                            </span>
                        </template>
                    </USelectMenu>
                </UFormField>
                <USeparator />

                <UFormField
                    name="image"
                    label="Image"
                >
                    <UFileUpload
                        v-model="image"
                        icon="i-lucide-image"
                        accept="image/*"
                        label="Drop your image here"
                        size="xl"
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
