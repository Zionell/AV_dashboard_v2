<script setup lang="ts">
import { format } from 'date-fns';
import type { IMaterialCard } from '#shared/types/material';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const toast = useToast();
const { $csrfFetch } = useNuxtApp();
const { isReadonly, readonlyAttrs } = useReadonly();

const { data: material, error } = await useFetch<IMaterialCard>(`/api/materials/${route.params.id}`);

if (error.value || !material.value) {
    throw createError({ statusCode: 404, statusMessage: 'Material not found' });
}

const isRemoving = ref(false);

const meta = computed(() => {
    const m = material.value;

    if (!m) return [];

    return [
        { label: 'Author', value: m.author?.name || '—' },
        { label: 'Project', value: m.project?.name || 'Shared' },
        { label: 'Created', value: format(new Date(m.createdAt), 'dd MMM yyyy') },
        { label: 'Updated', value: format(new Date(m.updatedAt), 'dd MMM yyyy, HH:mm') },
    ];
});

async function copyLink() {
    if (!material.value) return;

    await navigator.clipboard.writeText(material.value.sourceLink);
    toast.add({ title: 'Link copied', color: 'success' });
}

async function remove() {
    if (!material.value) return;

    try {
        isRemoving.value = true;

        await $csrfFetch('/api/materials', {
            method: 'DELETE',
            query: { id: material.value.id },
        });

        toast.add({ title: 'Material deleted', color: 'success' });
        router.push(ERoutes.MATERIALS);
    } catch (e) {
        console.warn('Material detail/ remove: ', e);
    } finally {
        isRemoving.value = false;
    }
}
</script>

<template>
    <UDashboardPanel
        id="materialDetail"
        :ui="{ body: 'lg:py-12' }"
    >
        <template #header>
            <UDashboardNavbar :title="material?.name">
                <template #leading>
                    <UButton
                        leading-icon="i-lucide-arrow-left"
                        variant="ghost"
                        color="neutral"
                        :to="ERoutes.MATERIALS"
                    />
                </template>

                <template #right>
                    <template v-if="userStore.canManageContent">
                        <UButton
                            v-bind="readonlyAttrs"
                            icon="i-lucide-pencil"
                            label="Edit"
                            variant="outline"
                            color="neutral"
                            :to="isReadonly ? undefined : `${ERoutes.MATERIALS}/${material?.id}/edit`"
                        />
                        <UButton
                            v-bind="readonlyAttrs"
                            icon="i-lucide-trash"
                            color="error"
                            variant="ghost"
                            :loading="isRemoving"
                            @click="remove"
                        />
                    </template>
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <div
                v-if="material"
                class="w-full max-w-3xl mx-auto grid gap-6"
            >
                <div class="flex flex-wrap items-center gap-3">
                    <ColoredLabel
                        v-if="material.category"
                        :bg-color="material.category.color"
                        class="uppercase text-[10px]"
                    >
                        {{ material.category.label }}
                    </ColoredLabel>
                    <UBadge
                        color="neutral"
                        variant="subtle"
                    >
                        {{ material.project?.name || 'Shared material' }}
                    </UBadge>
                </div>

                <UPageCard
                    variant="subtle"
                    :ui="{ container: 'p-4 sm:p-4' }"
                >
                    <dl class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div
                            v-for="item in meta"
                            :key="item.label"
                        >
                            <dt class="text-muted text-xs">{{ item.label }}</dt>
                            <dd class="font-medium">{{ item.value }}</dd>
                        </div>
                    </dl>
                </UPageCard>

                <UButton
                    icon="i-lucide-external-link"
                    :label="material.sourceLink"
                    variant="outline"
                    color="neutral"
                    class="w-fit max-w-full"
                    :to="material.sourceLink"
                    target="_blank"
                >
                    <template #trailing>
                        <UButton
                            icon="i-lucide-copy"
                            variant="ghost"
                            color="neutral"
                            size="xs"
                            @click.prevent.stop="copyLink"
                        />
                    </template>
                </UButton>

                <UPageCard
                    v-if="material.description"
                    variant="subtle"
                >
                    <div
                        class="prose prose-sm dark:prose-invert max-w-none"
                        v-html="material.description"
                    ></div>
                </UPageCard>
                <p
                    v-else
                    class="text-sm text-muted"
                >
                    No description.
                </p>
            </div>
        </template>
    </UDashboardPanel>
</template>
