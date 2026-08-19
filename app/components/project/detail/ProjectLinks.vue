<script setup lang="ts">
import type { ProjectLink } from '~~/prisma/generated/prisma/client';

const props = defineProps<{
    links: ProjectLink[];
}>();

/** Иконка по названию ссылки, чтобы блок выглядел как в макете. */
function linkIcon(name: string): string {
    const key = name.toLowerCase();

    if (key.includes('github') || key.includes('repo')) return 'i-lucide-github';
    if (key.includes('figma') || key.includes('design')) return 'i-lucide-figma';
    if (key.includes('doc') || key.includes('swagger') || key.includes('api')) return 'i-lucide-book-open';

    return 'i-lucide-globe';
}
</script>

<template>
    <BlockWrapper
        title="Project Links"
        :is-empty="!props.links.length"
    >
        <ul class="divide-y divide-default">
            <li
                v-for="link in props.links"
                :key="link.url"
            >
                <a
                    :href="link.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-3 py-3 px-4 hover:bg-elevated/50 transition"
                >
                    <UIcon
                        :name="linkIcon(link.name)"
                        class="w-4 h-4 text-muted shrink-0"
                    />
                    <span class="min-w-0">
                        <span class="block text-sm font-medium text-highlighted truncate">{{ link.name }}</span>
                        <span class="block text-xs text-muted truncate">{{ link.url }}</span>
                    </span>
                </a>
            </li>
        </ul>
    </BlockWrapper>
</template>
