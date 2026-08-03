<script setup lang="ts">
import type { EditorToolbarItem } from '@nuxt/ui';

const props = withDefaults(
    defineProps<{
        placeholder?: string;
    }>(),
    {
        placeholder: 'Describe the material…',
    }
);

const value = defineModel<string>({ default: '' });

const toolbarItems: EditorToolbarItem[][] = [
    [
        { kind: 'undo', icon: 'i-lucide-undo', tooltip: { text: 'Undo' } },
        { kind: 'redo', icon: 'i-lucide-redo', tooltip: { text: 'Redo' } },
    ],
    [
        { kind: 'heading', level: 1, icon: 'i-lucide-heading-1', tooltip: { text: 'Heading 1' } },
        { kind: 'heading', level: 2, icon: 'i-lucide-heading-2', tooltip: { text: 'Heading 2' } },
        { kind: 'heading', level: 3, icon: 'i-lucide-heading-3', tooltip: { text: 'Heading 3' } },
    ],
    [
        { kind: 'mark', mark: 'bold', icon: 'i-lucide-bold', tooltip: { text: 'Bold' } },
        { kind: 'mark', mark: 'italic', icon: 'i-lucide-italic', tooltip: { text: 'Italic' } },
        { kind: 'mark', mark: 'underline', icon: 'i-lucide-underline', tooltip: { text: 'Underline' } },
        { kind: 'mark', mark: 'strike', icon: 'i-lucide-strikethrough', tooltip: { text: 'Strikethrough' } },
        { kind: 'mark', mark: 'code', icon: 'i-lucide-code', tooltip: { text: 'Code' } },
    ],
    [
        { kind: 'bulletList', icon: 'i-lucide-list', tooltip: { text: 'Bullet List' } },
        { kind: 'orderedList', icon: 'i-lucide-list-ordered', tooltip: { text: 'Ordered List' } },
        { kind: 'blockquote', icon: 'i-lucide-text-quote', tooltip: { text: 'Blockquote' } },
        { kind: 'codeBlock', icon: 'i-lucide-square-code', tooltip: { text: 'Code Block' } },
    ],
    [{ kind: 'link', icon: 'i-lucide-link', tooltip: { text: 'Link' } }],
];
</script>

<template>
    <ClientOnly>
        <UEditor
            v-slot="{ editor }"
            v-model="value"
            content-type="html"
            :placeholder="props.placeholder"
            :mention="false"
            :image="false"
            :ui="{ base: 'p-4 min-h-48' }"
            class="w-full border border-default rounded-lg"
        >
            <UEditorToolbar
                :editor="editor"
                :items="toolbarItems"
                class="border-b border-default px-2 py-1.5 overflow-x-auto"
            />
        </UEditor>

        <template #fallback>
            <USkeleton class="w-full h-48" />
        </template>
    </ClientOnly>
</template>
