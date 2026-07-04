<script setup lang="ts">
import type { IProject } from '#shared/types/projects';

const { $csrfFetch } = useNuxtApp();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const isLoading = ref(false);

const { data, error } = await useFetch<IProject>(`/api/projects/${route.params.id}`, {
    key: `project-${route.params.id}`,
});

if (error.value || !data.value) {
    throw createError({
        statusCode: 404,
        statusMessage: 'Page Not Found',
    });
}

async function handleRemove() {
    try {
        isLoading.value = true;

        await $csrfFetch(`/api/projects/${route.params.id}/`, {
            method: 'DELETE',
        });

        toast.add({
            title: 'Success',
            description: 'Your project have been deleted.',
            icon: 'i-lucide-check',
            color: 'success',
        });
        handleBack();
    } catch (e) {
        console.warn('ProjectDetailPage/ handleRemove: ', e);
    } finally {
        isLoading.value = false;
    }
}

function handleBack() {
    router.push(ERoutes.PROJECTS);
}
</script>

<template>
    <UDashboardPanel
        id="projectDetail"
        :ui="{ body: 'lg:py-12' }"
    >
        <template #header>
            <UDashboardNavbar title="Projects">
                <template #leading>
                    <UButton
                        leading-icon="i-lucide-arrow-left"
                        variant="ghost"
                        color="neutral"
                        @click="handleBack"
                    />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <div class="relative border-b border-default pb-8 flex items-center justify-between">
                <h1
                    v-if="data?.name"
                    class="text-3xl sm:text-4xl text-pretty font-bold text-highlighted"
                >
                    {{ data.name }}
                </h1>

                <UButton
                    color="error"
                    variant="outline"
                    @click="handleRemove"
                >
                    Remove
                </UButton>
            </div>

            <div class="w-full max-w-(--ui-container) flex flex-col lg:grid gap-8 sm:gap-16 lg:grid-cols-2">
                <div>
                    <UUser
                        name="John Doe"
                        description="Software Engineer"
                        :avatar="{
                            src: 'https://i.pravatar.cc/150?u=john-doe',
                        }"
                        size="xl"
                    />
                </div>

                <NuxtImg
                    class="rounded-lg shadow-2xl ring ring-default"
                    :src="data?.image"
                    :alt="data?.name"
                    placeholder
                    loading="lazy"
                />
            </div>
        </template>
    </UDashboardPanel>
</template>
