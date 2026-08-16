<script setup lang="ts">
import * as z from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import type { IMaterialCard } from '#shared/types/material';
import { generateColorFromString } from '~/utils/colors';

const props = defineProps<{
    material?: IMaterialCard | null;
}>();

const { $csrfFetch } = useNuxtApp();
const toast = useToast();
const { readonlyAttrs } = useReadonly();

const isLoading = ref(false);
const errorMsg = ref('');

const schema = z.object({
    name: z.string('Name is required').trim().min(1, 'Name is required'),
    categoryId: z.string('Type is required').min(1, 'Type is required'),
    sourceLink: z.string().optional(),
    projectId: z.string().optional(),
    description: z.string().optional(),
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
    name: props.material?.name || '',
    categoryId: props.material?.categoryId || '',
    sourceLink: props.material?.sourceLink || '',
    projectId: props.material?.projectId || undefined,
    description: props.material?.description || '',
});

const { data: categories, refresh: refreshCategories } = await useLazyFetch('/api/materials/categories', {
    default: () => [],
});

const { data: projects } = await useLazyFetch('/api/projects', {
    query: { take: 50 },
});

const categoryItems = computed(() => (categories.value || []).map((c) => ({ label: c.label, value: c.id })));

const projectItems = computed(() => [
    { label: 'Shared (whole company)', value: undefined },
    ...(projects.value?.results || []).map((p) => ({ label: p.name, value: p.id })),
]);

async function createCategory(item: string) {
    const label = item.trim();

    if (!label) return;

    try {
        const created = await $csrfFetch('/api/materials/categories', {
            method: 'POST',
            body: { label, color: generateColorFromString(label) },
        });

        await refreshCategories();
        state.categoryId = created.id;
    } catch (e) {
        console.warn('MaterialForm/ createCategory: ', e);
    }
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
    try {
        isLoading.value = true;
        errorMsg.value = '';

        let id = props.material?.id;

        if (id) {
            await $csrfFetch(`/api/materials/${id}`, {
                method: 'PATCH',
                body: {
                    ...event.data,
                    projectId: event.data.projectId ?? null,
                },
            });
        } else {
            const created = await $csrfFetch('/api/materials', {
                method: 'POST',
                body: event.data,
            });

            id = created.id;
        }

        toast.add({ title: props.material ? 'Material updated' : 'Material created', color: 'success' });
        await navigateTo(`${ERoutes.MATERIALS}/${id}`);
    } catch (e) {
        errorMsg.value = (e as { data?: { message?: string } })?.data?.message || 'Failed to save';
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
    <UForm
        :schema="schema"
        :state="state"
        class="grid gap-6"
        @submit="onSubmit"
    >
        <UFormField
            required
            label="Name"
            name="name"
        >
            <UInput
                v-model="state.name"
                size="lg"
                class="w-full"
            />
        </UFormField>

        <div class="grid sm:grid-cols-3 gap-4">
            <UFormField
                label="Link"
                name="sourceLink"
            >
                <UInput
                    v-model="state.sourceLink"
                    placeholder="https://…"
                    class="w-full"
                />
            </UFormField>

            <UFormField
                required
                label="Type"
                name="categoryId"
            >
                <USelectMenu
                    v-model="state.categoryId"
                    create-item
                    value-key="value"
                    placeholder="Select type"
                    :items="categoryItems"
                    class="w-full"
                    @create="createCategory"
                />
            </UFormField>

            <UFormField
                label="Project"
                name="projectId"
            >
                <USelect
                    v-model="state.projectId"
                    :items="projectItems"
                    placeholder="Shared (whole company)"
                    class="w-full"
                />
            </UFormField>
        </div>

        <UFormField
            label="Description"
            name="description"
        >
            <MaterialEditor v-model="state.description" />
        </UFormField>

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
                :to="ERoutes.MATERIALS"
            />
            <UButton
                v-bind="readonlyAttrs"
                type="submit"
                :loading="isLoading"
                :label="material ? 'Save' : 'Create'"
            />
        </div>
    </UForm>
</template>
