<script setup lang="ts">
import * as z from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import { toBase64 } from '~/assets/ts/files';
import { EProjectPriority, type IProjectDetail } from '#shared/types/projects';

const props = defineProps<{
    /** Проект для редактирования; без него форма работает в режиме создания. */
    project?: IProjectDetail | null;
}>();

const { $csrfFetch } = useNuxtApp();
const toast = useToast();

const isLoading = ref(false);
const errorMsg = ref('');
const imageFile = ref<File | null>(null);

const linkSchema = z.object({
    name: z.string('Name is required').trim().min(1, 'Name is required'),
    url: z.url('Invalid URL'),
});

const schema = z.object({
    name: z.string('Name is required').trim().min(1, 'Name is required'),
    description: z.string().optional(),
    client: z.string().optional(),
    priority: z.enum(EProjectPriority).optional(),
    startDate: z.string().optional(),
    deadline: z.string().optional(),
    budget: z.number().int().nonnegative().optional(),
    links: z.array(linkSchema).optional(),
    users: z.array(z.string()).optional(),
});

type Schema = z.output<typeof schema>;

function toDateInput(value: Date | string | null | undefined): string | undefined {
    return value ? new Date(value).toISOString().slice(0, 10) : undefined;
}

const state = reactive<Partial<Schema>>({
    name: props.project?.name || '',
    description: props.project?.description || '',
    client: props.project?.client || '',
    priority: (props.project?.priority as EProjectPriority) || undefined,
    startDate: toDateInput(props.project?.startDate),
    deadline: toDateInput(props.project?.deadline),
    budget: props.project?.budget ?? undefined,
    links: (props.project?.links || []).map((l) => ({ name: l.name, url: l.url })),
    users: (props.project?.members || []).map((m) => m.id),
});

// Без await: top-level await делает компонент async, и template ref/expose у родителя ломаются.
const { data: users, status: usersStatus } = useLazyFetch('/api/users/specs', {
    default: () => [],
});

const priorityItems = [
    { label: '—', value: undefined },
    { label: 'High', value: EProjectPriority.HIGH },
    { label: 'Medium', value: EProjectPriority.MEDIUM },
    { label: 'Low', value: EProjectPriority.LOW },
];

function addLink() {
    state.links = [...(state.links || []), { name: '', url: '' }];
}

function removeLink(index: number) {
    state.links = (state.links || []).filter((_, i) => i !== index);
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
    try {
        isLoading.value = true;
        errorMsg.value = '';

        const image = imageFile.value ? await toBase64(imageFile.value) : undefined;

        const body = {
            ...event.data,
            image,
            startDate: event.data.startDate || null,
            deadline: event.data.deadline || null,
            priority: event.data.priority ?? null,
            budget: event.data.budget ?? null,
        };

        let id = props.project?.id;

        if (id) {
            await $csrfFetch(`/api/projects/${id}`, {
                method: 'PATCH',
                body,
            });
        } else {
            const created = await $csrfFetch('/api/projects', {
                method: 'POST',
                body: { ...event.data, image },
            });

            id = created.id;
        }

        toast.add({ title: props.project ? 'Project updated' : 'Project created', color: 'success' });
        await navigateTo(`${ERoutes.PROJECTS}/${id}`);
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

        <UFormField
            label="Description"
            name="description"
        >
            <UTextarea
                v-model="state.description"
                :rows="3"
                class="w-full"
            />
        </UFormField>

        <div class="grid sm:grid-cols-3 gap-4">
            <UFormField
                label="Client"
                name="client"
            >
                <UInput
                    v-model="state.client"
                    class="w-full"
                />
            </UFormField>

            <UFormField
                label="Priority"
                name="priority"
            >
                <USelect
                    v-model="state.priority"
                    :items="priorityItems"
                    placeholder="—"
                    class="w-full"
                />
            </UFormField>

            <UFormField
                label="Budget, $"
                name="budget"
            >
                <UInputNumber
                    v-model="state.budget"
                    :min="0"
                    class="w-full"
                />
            </UFormField>

            <UFormField
                label="Start date"
                name="startDate"
            >
                <UInput
                    v-model="state.startDate"
                    type="date"
                    class="w-full"
                />
            </UFormField>

            <UFormField
                label="Deadline"
                name="deadline"
            >
                <UInput
                    v-model="state.deadline"
                    type="date"
                    class="w-full"
                />
            </UFormField>
        </div>

        <UFormField
            label="Members"
            name="users"
        >
            <USelectMenu
                v-model="state.users"
                :loading="usersStatus === 'pending'"
                :items="users"
                class="w-full"
                multiple
                value-key="id"
                label-key="name"
            />
        </UFormField>

        <!-- Ссылки проекта: production, repo, figma и т.д. -->
        <UFormField
            label="Links"
            name="links"
        >
            <div class="grid gap-2">
                <div
                    v-for="(link, index) in state.links"
                    :key="index"
                    class="flex gap-2"
                >
                    <UFormField :name="`links.${index}.name`">
                        <UInput
                            v-model="link.name"
                            placeholder="Name (GitHub, Figma…)"
                            class="w-44"
                        />
                    </UFormField>
                    <UFormField
                        :name="`links.${index}.url`"
                        class="grow"
                    >
                        <UInput
                            v-model="link.url"
                            placeholder="https://…"
                            class="w-full"
                        />
                    </UFormField>
                    <UButton
                        icon="i-lucide-trash"
                        variant="ghost"
                        color="neutral"
                        @click="removeLink(index)"
                    />
                </div>
                <UButton
                    icon="i-lucide-plus"
                    label="Add link"
                    variant="outline"
                    color="neutral"
                    class="w-fit"
                    @click="addLink"
                />
            </div>
        </UFormField>

        <UFormField
            label="Preview"
            name="image"
        >
            <div class="grid gap-2">
                <NuxtImg
                    v-if="project?.image && !imageFile"
                    :src="project.image"
                    :alt="project.name"
                    class="rounded-lg ring ring-default max-w-60"
                />
                <UFileUpload
                    v-model="imageFile"
                    icon="i-lucide-image"
                    accept="image/*"
                    label="Drop your image here"
                    size="xl"
                />
            </div>
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
                :to="project ? `${ERoutes.PROJECTS}/${project.id}` : ERoutes.PROJECTS"
            />
            <UButton
                type="submit"
                :loading="isLoading"
                :label="project ? 'Save' : 'Create'"
            />
        </div>
    </UForm>
</template>
