<script setup lang="ts">
import type { Project } from '@prisma/client';
import type { IMaterial } from '#shared/types/material';
import type { ITodoProgress } from '#shared/types/todo';
import type { IUserShort } from '#shared/types/user';
import type { IPaginatedResponse } from '#shared/types';

const userStore = useUserStore();

const todoProgress = ref<ITodoProgress | null>(null);
const materials = ref<IMaterial[]>([]);
const todosStatuses = ref();
const todosGrouped = ref();
const users = ref<IUserShort[]>([]);
const todos = ref<ITodo[]>([]);

const { data, error } = await useAsyncData('dashboard', async () => {
    const companyId = userStore.user?.companyId;
    const userId = userStore.user?.id;

    const [materials, users, todos] = await Promise.all([
        $fetch<IPaginatedResponse<IMaterial>>('/api/materials', {
            query: {
                companyId: companyId,
            },
        }),
        $fetch<IPaginatedResponse<IUserShort>>('/api/users/list', {
            query: {
                companyId: companyId,
            },
        }),
        $fetch('/api/todo', {
            query: {
                userId: userId,
            },
        }),
    ]);

    // const query = currentProject?.id;
    // let todosGrouped, todosStatuses, todoProgress;
    //
    // if (query) {
    //     [todosGrouped, todosStatuses, todoProgress] = await Promise.all([
    //         $fetch('/api/todo/group', {
    //             query: {
    //                 curProjectId: currentProject?.id,
    //             },
    //         }),
    //         $fetch('/api/todo/status-spec', {
    //             query: {
    //                 curProjectId: currentProject?.id,
    //             },
    //         }),
    //         $fetch('/api/todo/progress', {
    //             query: {
    //                 curProjectId: currentProject?.id,
    //             },
    //         }),
    //     ]);
    // }

    return {
        materials: materials.results,
        users: users.results,
        todos,
        // todosGrouped,
        // todosStatuses,
        // todoProgress,
    };
});

if (data.value) {
    materials.value = data.value?.materials || [];
    users.value = data.value?.users || [];
    todos.value = data.value?.todos || [];
    // todosGrouped.value = data.value?.todosGrouped || null;
    // todosStatuses.value = data.value?.todosStatuses || null;
    // todoProgress.value = data.value?.todoProgress || null;
}
</script>

<template>
    <UDashboardPanel id="home">
        <template #header>
            <UDashboardNavbar
                title="Home"
                :ui="{ right: 'gap-3' }"
            >
                <template #right>
                    <UTooltip
                        text="Notifications"
                        :shortcuts="['N']"
                    >
                        <UButton
                            color="neutral"
                            variant="ghost"
                            square
                        >
                            <UChip
                                color="error"
                                inset
                            >
                                <UIcon
                                    name="i-lucide-bell"
                                    class="size-5 shrink-0"
                                />
                            </UChip>
                        </UButton>
                    </UTooltip>
                </template>
            </UDashboardNavbar>

            <UDashboardToolbar class="py-6">
                <template #left>
                    <CurrentDate />
                </template>

                <template #right>
                    <HomeStartSession />
                </template>
            </UDashboardToolbar>
        </template>

        <template #body>
            <div class="grid grid-cols-3 gap-7">
                <HomeMyProgress :progress="todoProgress" />
                <HomeSessionRecording />
                <!--                <HomeCurrentProject />-->
            </div>
            <div class="grid grid-cols-2 gap-7">
                <HomeMaterials :items="materials" />
                <!--                <HomeOverallProgress-->
                <!--                    :labels="todosStatuses"-->
                <!--                    :values="todosGrouped"-->
                <!--                />-->
                <HomeParticipants :users="users" />
                <HomeToDo :todos="todos" />
            </div>
        </template>
    </UDashboardPanel>
</template>
