<script setup lang="ts">
import type { ITaskAttachment, ITaskAttachmentFull } from '#shared/types/todo';
import { MAX_ATTACHMENTS_PER_TASK } from '#shared/constants';
import { toBase64 } from '~/assets/ts/files';

const props = defineProps<{
    todoId: string;
}>();

const emit = defineEmits<{
    changed: [];
}>();

const { $csrfFetch } = useNuxtApp();
const toast = useToast();
const userStore = useUserStore();

const attachments = ref<ITaskAttachment[]>([]);
const isLoading = ref(false);
const isUploading = ref(false);
const fileInput = useTemplateRef('fileInput');

// Лайтбокс просмотра изображения. Список приходит без base64 — содержимое
// подгружаем по клику и кешируем, чтобы повторное открытие не ходило в сеть.
const previewItem = ref<ITaskAttachment | null>(null);
const previewData = ref<string | null>(null);
const isPreviewOpen = ref(false);
const isPreviewLoading = ref(false);
const dataCache = new Map<string, string>();

// Тот же потолок, что и на сервере: кнопку гасим заранее, а не ловим 400 после выбора файла.
const atLimit = computed(() => attachments.value.length >= MAX_ATTACHMENTS_PER_TASK);

watch(
    () => props.todoId,
    async (todoId) => {
        if (!todoId) return;

        try {
            isLoading.value = true;
            attachments.value = await $fetch<ITaskAttachment[]>('/api/todo/attachments', { query: { todoId } });
        } catch (e) {
            console.warn('TaskAttachments/ load: ', e);
        } finally {
            isLoading.value = false;
        }
    },
    { immediate: true }
);

async function onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    input.value = '';

    if (!file) return;

    if (!file.type.startsWith('image/')) {
        toast.add({ title: 'Only images can be attached', color: 'error' });

        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        toast.add({ title: 'Image is too large (max 2MB)', color: 'error' });

        return;
    }

    try {
        isUploading.value = true;

        const data = await toBase64(file);
        const attachment = await $csrfFetch<ITaskAttachment>('/api/todo/attachments', {
            method: 'POST',
            body: { todoId: props.todoId, name: file.name, data },
        });

        // Файл уже у нас в руках — кладём в кеш, чтобы просмотр сразу после
        // загрузки открылся без запроса.
        dataCache.set(attachment.id, data);
        attachments.value.push(attachment);
        emit('changed');
    } catch (e) {
        console.warn('TaskAttachments/ upload: ', e);
        toast.add({ title: 'Failed to attach image', color: 'error' });
    } finally {
        isUploading.value = false;
    }
}

async function remove(attachment: ITaskAttachment) {
    try {
        await $csrfFetch('/api/todo/attachments', {
            method: 'DELETE',
            query: { id: attachment.id },
        });

        dataCache.delete(attachment.id);
        attachments.value = attachments.value.filter((a) => a.id !== attachment.id);
        emit('changed');
    } catch (e) {
        console.warn('TaskAttachments/ remove: ', e);
        toast.add({ title: 'Failed to delete attachment', color: 'error' });
    }
}

async function openPreview(attachment: ITaskAttachment) {
    previewItem.value = attachment;
    previewData.value = dataCache.get(attachment.id) ?? null;
    isPreviewOpen.value = true;

    if (previewData.value) return;

    try {
        isPreviewLoading.value = true;

        const full = await $fetch<ITaskAttachmentFull>(`/api/todo/attachments/${attachment.id}`);

        dataCache.set(attachment.id, full.data);

        // Пока грузили, пользователь мог закрыть окно или открыть другое вложение.
        if (previewItem.value?.id === attachment.id) previewData.value = full.data;
    } catch (e) {
        console.warn('TaskAttachments/ preview: ', e);
        toast.add({ title: 'Failed to load image', color: 'error' });
    } finally {
        isPreviewLoading.value = false;
    }
}
</script>

<template>
    <div class="grid gap-3">
        <div class="flex items-center justify-between gap-2">
            <h4 class="text-sm font-semibold text-highlighted">Attachments ({{ attachments.length }})</h4>
            <UButton
                :label="atLimit ? `Max ${MAX_ATTACHMENTS_PER_TASK} files` : 'Add image'"
                icon="i-lucide-paperclip"
                variant="ghost"
                size="xs"
                :loading="isUploading"
                :disabled="atLimit"
                @click="fileInput?.click()"
            />
            <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="onFileChange"
            />
        </div>

        <div
            v-if="attachments.length"
            class="grid grid-cols-3 gap-2"
        >
            <div
                v-for="attachment in attachments"
                :key="attachment.id"
                class="group relative"
            >
                <!-- Превью не рисуем: base64 в списке не приходит, картинка грузится по клику. -->
                <button
                    type="button"
                    class="h-20 w-full grid place-content-center gap-1 px-2 rounded-lg ring ring-default bg-elevated/50 hover:bg-elevated transition cursor-pointer"
                    :title="attachment.name"
                    @click="openPreview(attachment)"
                >
                    <UIcon
                        name="i-lucide-image"
                        class="size-6 mx-auto text-muted"
                    />
                    <span class="text-xs text-muted truncate max-w-full">{{ attachment.name }}</span>
                </button>
                <UButton
                    v-if="userStore.canManageContent"
                    icon="i-lucide-x"
                    color="error"
                    size="xs"
                    class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition"
                    @click="remove(attachment)"
                />
            </div>
        </div>
        <p
            v-else-if="!isLoading"
            class="text-sm text-muted"
        >
            No attachments yet.
        </p>

        <UModal
            v-model:open="isPreviewOpen"
            :title="previewItem?.name || ''"
        >
            <template #body>
                <img
                    v-if="previewData"
                    :src="previewData"
                    :alt="previewItem?.name"
                    class="w-full rounded-lg"
                />
                <div
                    v-else-if="isPreviewLoading"
                    class="grid place-content-center py-12"
                >
                    <UIcon
                        name="i-lucide-loader-circle"
                        class="size-6 animate-spin text-muted"
                    />
                </div>
            </template>
        </UModal>
    </div>
</template>
