<script setup lang="ts">
import { format } from 'date-fns';
import type { IProjectDetail } from '#shared/types/projects';

const { $csrfFetch } = useNuxtApp();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const userStore = useUserStore();
const isLoading = ref(false);

const { data: project, error } = await useFetch<IProjectDetail>(`/api/projects/${route.params.id}`, {
    key: `project-${route.params.id}`,
});

if (error.value || !project.value) {
    throw createError({
        statusCode: 404,
        statusMessage: 'Page Not Found',
    });
}

const metaLine = computed(() => {
    const p = project.value;

    if (!p) return [];

    return [
        { icon: 'i-lucide-calendar-plus', label: `Created: ${format(new Date(p.createdAt), 'dd MMM yyyy')}` },
        ...(p.deadline
            ? [{ icon: 'i-lucide-alarm-clock', label: `Deadline: ${format(new Date(p.deadline), 'dd MMM yyyy')}` }]
            : []),
        ...(p.client ? [{ icon: 'i-lucide-briefcase', label: `Client: ${p.client}` }] : []),
    ];
});

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
            <UDashboardNavbar
                title="Projects"
                :ui="{ right: 'gap-3' }"
            >
                <template #leading>
                    <UButton
                        leading-icon="i-lucide-arrow-left"
                        variant="ghost"
                        color="neutral"
                        @click="handleBack"
                    />
                </template>

                <template #right>
                    <UButton
                        v-if="userStore.canManageContent"
                        label="Edit Project"
                        variant="outline"
                        color="neutral"
                        :to="`${ERoutes.PROJECTS}/${route.params.id}/edit`"
                    />
                    <UButton
                        v-if="userStore.isOwner"
                        color="error"
                        variant="outline"
                        :loading="isLoading"
                        @click="handleRemove"
                    >
                        Remove
                    </UButton>
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <section
                v-if="project"
                class="grid gap-6"
            >
                <!-- Заголовок + мета -->
                <header class="grid gap-3">
                    <div class="flex items-center gap-4">
                        <h1 class="text-3xl sm:text-4xl text-pretty font-bold text-highlighted">
                            {{ project.name }}
                        </h1>
                        <UBadge
                            :color="project.isClosed ? 'neutral' : 'success'"
                            variant="subtle"
                        >
                            {{ project.isClosed ? 'Closed' : 'In Progress' }}
                        </UBadge>
                    </div>

                    <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                        <span
                            v-for="item in metaLine"
                            :key="item.label"
                            class="flex items-center gap-1.5"
                        >
                            <UIcon
                                :name="item.icon"
                                class="w-4 h-4"
                            />
                            {{ item.label }}
                        </span>
                    </div>
                </header>

                <!-- Стат-карты + превью -->
                <div class="grid xl:grid-cols-[1fr_24rem] gap-6 items-start">
                    <div class="grid gap-6">
                        <ProjectStatCards :stats="project.stats" />
                        <ProjectProgress :stats="project.stats" />
                    </div>

                    <UPageCard
                        variant="subtle"
                        :ui="{ container: 'p-4 sm:p-4' }"
                    >
                        <h3 class="font-semibold text-highlighted">Preview</h3>
                        <NuxtImg
                            v-if="project.image"
                            class="rounded-lg ring ring-default w-full"
                            :src="project.image"
                            :alt="project.name"
                            placeholder
                            loading="lazy"
                        />
                        <UEmpty
                            v-else
                            variant="naked"
                            icon="i-lucide-image"
                            title="No preview yet"
                        />
                    </UPageCard>
                </div>

                <!-- Информация, команда, последние задачи -->
                <div class="grid lg:grid-cols-3 gap-6 items-start">
                    <ProjectInfo :project="project" />
                    <ProjectTeam :members="project.members" />
                    <ProjectRecentTasks :tasks="project.recentTasks" />
                </div>

                <!-- Активность, материалы, ссылки -->
                <div class="grid lg:grid-cols-3 gap-6 items-start">
                    <ProjectActivity :events="project.events" />
                    <ProjectMaterials
                        :materials="project.materials"
                        :project-id="project.id"
                    />
                    <ProjectLinks :links="project.links" />
                </div>
            </section>
        </template>
    </UDashboardPanel>
</template>
