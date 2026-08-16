<script setup lang="ts">
import * as z from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import { ETodoStatus } from '#shared/types/times';
import { ETaskPriority, type ITaskCard } from '#shared/types/todo';

const emit = defineEmits<{
    refresh: [];
}>();

const { $csrfFetch } = useNuxtApp();
const toast = useToast();
const { readonlyAttrs } = useReadonly();

const isOpen = ref(false);
const isLoading = ref(false);
const errorMsg = ref('');

// id редактируемой задачи; null — режим создания.
const editingId = ref<string | null>(null);

const schema = z.object({
    name: z.string('Name is required').trim().min(1, 'Name is required'),
    description: z.string().optional(),
    projectId: z.string('Project is required').min(1, 'Project is required'),
    executorId: z.string('Assignee is required').min(1, 'Assignee is required'),
    status: z.enum([ETodoStatus.TODO, ETodoStatus.IN_PROGRESS, ETodoStatus.REVIEW, ETodoStatus.DONE]),
    priority: z.enum(ETaskPriority).optional(),
    dueDate: z.string().optional(),
    estimateHours: z.number().int().positive().optional(),
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
    status: ETodoStatus.TODO,
});

// Без await: top-level await делает компонент async, и exposed open() не доступен через template ref.
const { data: projects } = useLazyFetch('/api/projects', {
    query: { take: 50 },
});

const projectItems = computed(() => (projects.value?.results || []).map((p) => ({ label: p.name, value: p.id })));

const { data: users } = useLazyFetch('/api/users/specs', {
    default: () => [],
});

const userItems = computed(() => (users.value || []).map((u) => ({ label: u.name || u.id, value: u.id })));

const statusItems = [
    { label: 'Todo', value: ETodoStatus.TODO },
    { label: 'In Progress', value: ETodoStatus.IN_PROGRESS },
    { label: 'Review', value: ETodoStatus.REVIEW },
    { label: 'Done', value: ETodoStatus.DONE },
];

const priorityItems = [
    { label: 'High', value: ETaskPriority.HIGH },
    { label: 'Medium', value: ETaskPriority.MEDIUM },
    { label: 'Low', value: ETaskPriority.LOW },
];

function resetState() {
    Object.assign(state, {
        name: '',
        description: '',
        projectId: undefined,
        executorId: undefined,
        status: ETodoStatus.TODO,
        priority: undefined,
        dueDate: undefined,
        estimateHours: undefined,
    });
}

function open(status?: ETodoStatus) {
    editingId.value = null;
    resetState();
    state.status = status ?? ETodoStatus.TODO;
    errorMsg.value = '';
    isOpen.value = true;
}

function openEdit(task: ITaskCard) {
    editingId.value = task.id;
    Object.assign(state, {
        name: task.name,
        description: task.description || '',
        projectId: task.projectId,
        executorId: task.executorId,
        status: task.status,
        priority: (task.priority as ETaskPriority) || undefined,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : undefined,
        estimateHours: task.estimateHours ?? undefined,
    });
    errorMsg.value = '';
    isOpen.value = true;
}

function close() {
    isOpen.value = false;
}

defineExpose({ open, openEdit });

async function onSubmit(event: FormSubmitEvent<Schema>) {
    try {
        isLoading.value = true;
        errorMsg.value = '';

        if (editingId.value) {
            // Проект при редактировании не меняем; null очищает необязательные поля.
            await $csrfFetch(`/api/todo?id=${editingId.value}`, {
                method: 'PUT',
                body: {
                    name: event.data.name,
                    description: event.data.description ?? '',
                    executorId: event.data.executorId,
                    status: event.data.status,
                    priority: event.data.priority ?? null,
                    dueDate: event.data.dueDate || null,
                    estimateHours: event.data.estimateHours ?? null,
                },
            });
            toast.add({ title: 'Task updated', color: 'success' });
        } else {
            await $csrfFetch('/api/todo', {
                method: 'POST',
                body: {
                    ...event.data,
                    dueDate: event.data.dueDate || undefined,
                },
            });
            toast.add({ title: 'Task created', color: 'success' });
        }

        isOpen.value = false;
        resetState();
        emit('refresh');
    } catch (e) {
        errorMsg.value =
            (e as { data?: { message?: string } })?.data?.message ||
            (editingId.value ? 'Failed to save task' : 'Failed to create task');
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
    <UModal
        v-model:open="isOpen"
        :title="editingId ? 'Edit Task' : 'Create Task'"
    >
        <template #body>
            <UForm
                :schema="schema"
                :state="state"
                class="grid gap-4"
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

                <div class="grid sm:grid-cols-2 gap-4">
                    <UFormField
                        required
                        label="Project"
                        name="projectId"
                    >
                        <USelect
                            v-model="state.projectId"
                            :items="projectItems"
                            placeholder="Select project"
                            :disabled="!!editingId"
                            class="w-full"
                        />
                    </UFormField>

                    <UFormField
                        required
                        label="Assignee"
                        name="executorId"
                    >
                        <USelect
                            v-model="state.executorId"
                            :items="userItems"
                            placeholder="Select assignee"
                            class="w-full"
                        />
                    </UFormField>

                    <UFormField
                        label="Status"
                        name="status"
                    >
                        <USelect
                            v-model="state.status"
                            :items="statusItems"
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
                        label="Due date"
                        name="dueDate"
                    >
                        <UInput
                            v-model="state.dueDate"
                            type="date"
                            class="w-full"
                        />
                    </UFormField>

                    <UFormField
                        label="Estimate, h"
                        name="estimateHours"
                    >
                        <UInputNumber
                            v-model="state.estimateHours"
                            :min="1"
                            class="w-full"
                        />
                    </UFormField>
                </div>

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
                        v-bind="readonlyAttrs"
                        type="submit"
                        :label="editingId ? 'Save' : 'Create'"
                        :loading="isLoading"
                    />
                </div>
            </UForm>
        </template>
    </UModal>
</template>
