<script setup lang="ts">
import { format } from 'date-fns';
import type { ITaskComment } from '#shared/types/todo';

const props = defineProps<{
    todoId: string;
}>();

const emit = defineEmits<{
    changed: [];
}>();

const { $csrfFetch } = useNuxtApp();
const toast = useToast();
const userStore = useUserStore();
const { isReadonly, readonlyAttrs } = useReadonly();

const comments = ref<ITaskComment[]>([]);
const isLoading = ref(false);
const isSending = ref(false);
const newText = ref('');

// Inline-редактирование: id редактируемого коммента + черновик текста.
const editingId = ref<string | null>(null);
const editText = ref('');

watch(
    () => props.todoId,
    async (todoId) => {
        if (!todoId) return;

        try {
            isLoading.value = true;
            comments.value = await $fetch<ITaskComment[]>('/api/todo/comments', { query: { todoId } });
        } catch (e) {
            console.warn('TaskComments/ load: ', e);
        } finally {
            isLoading.value = false;
        }
    },
    { immediate: true }
);

async function send() {
    const text = newText.value.trim();

    if (!text) return;

    try {
        isSending.value = true;

        const comment = await $csrfFetch<ITaskComment>('/api/todo/comments', {
            method: 'POST',
            body: { todoId: props.todoId, text },
        });

        comments.value.push(comment);
        newText.value = '';
        emit('changed');
    } catch (e) {
        console.warn('TaskComments/ send: ', e);
        toast.add({ title: 'Failed to add comment', color: 'error' });
    } finally {
        isSending.value = false;
    }
}

function startEdit(comment: ITaskComment) {
    editingId.value = comment.id;
    editText.value = comment.text;
}

function cancelEdit() {
    editingId.value = null;
    editText.value = '';
}

async function saveEdit(comment: ITaskComment) {
    const text = editText.value.trim();

    if (!text) return;

    try {
        const updated = await $csrfFetch<ITaskComment>(`/api/todo/comments?id=${comment.id}`, {
            method: 'PUT',
            body: { text },
        });

        comments.value = comments.value.map((c) => (c.id === updated.id ? updated : c));
        cancelEdit();
    } catch (e) {
        console.warn('TaskComments/ saveEdit: ', e);
        toast.add({ title: 'Failed to save comment', color: 'error' });
    }
}

async function remove(comment: ITaskComment) {
    try {
        await $csrfFetch('/api/todo/comments', {
            method: 'DELETE',
            query: { id: comment.id },
        });

        comments.value = comments.value.filter((c) => c.id !== comment.id);
        emit('changed');
    } catch (e) {
        console.warn('TaskComments/ remove: ', e);
        toast.add({ title: 'Failed to delete comment', color: 'error' });
    }
}

function formatDate(value: Date | string) {
    return format(new Date(value), 'dd MMM, HH:mm');
}
</script>

<template>
    <div class="grid gap-3">
        <h4 class="text-sm font-semibold text-highlighted">Comments ({{ comments.length }})</h4>

        <div
            v-if="comments.length"
            class="grid gap-3"
        >
            <div
                v-for="comment in comments"
                :key="comment.id"
                class="group grid gap-1.5 rounded-lg bg-elevated/50 p-3"
            >
                <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2 min-w-0">
                        <UAvatar
                            :src="comment.author?.image || ''"
                            :alt="comment.author?.name || ''"
                            size="2xs"
                        />
                        <span class="text-sm font-medium truncate">{{ comment.author?.name || '—' }}</span>
                        <span class="text-xs text-muted shrink-0">{{ formatDate(comment.createdAt) }}</span>
                    </div>

                    <div
                        v-if="userStore.canManageContent && editingId !== comment.id"
                        class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition"
                    >
                        <UButton
                            v-bind="readonlyAttrs"
                            icon="i-lucide-pencil"
                            variant="ghost"
                            color="neutral"
                            size="xs"
                            @click="startEdit(comment)"
                        />
                        <UButton
                            v-bind="readonlyAttrs"
                            icon="i-lucide-trash"
                            variant="ghost"
                            color="error"
                            size="xs"
                            @click="remove(comment)"
                        />
                    </div>
                </div>

                <template v-if="editingId === comment.id">
                    <UTextarea
                        v-model="editText"
                        :rows="2"
                        autoresize
                        class="w-full"
                    />
                    <div class="flex items-center gap-2">
                        <UButton
                            label="Save"
                            size="xs"
                            @click="saveEdit(comment)"
                        />
                        <UButton
                            label="Cancel"
                            size="xs"
                            variant="ghost"
                            color="neutral"
                            @click="cancelEdit"
                        />
                    </div>
                </template>
                <p
                    v-else
                    class="text-sm whitespace-pre-line"
                >
                    {{ comment.text }}
                </p>
            </div>
        </div>
        <p
            v-else-if="!isLoading"
            class="text-sm text-muted"
        >
            No comments yet.
        </p>

        <div class="grid gap-2">
            <UTextarea
                v-model="newText"
                v-bind="readonlyAttrs"
                placeholder="Write a comment…"
                :rows="2"
                autoresize
                class="w-full"
            />
            <UButton
                :title="readonlyAttrs.title"
                :style="readonlyAttrs.style"
                label="Comment"
                icon="i-lucide-send"
                size="sm"
                class="justify-self-end"
                :loading="isSending"
                :disabled="isReadonly || !newText.trim()"
                @click="send"
            />
        </div>
    </div>
</template>
