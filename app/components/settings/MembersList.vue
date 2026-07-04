<script setup lang="ts">
import type { IUserShort } from '#shared/types/user';
import type { IPaginatedResponse } from '#shared/types';

const userStore = useUserStore();

const pageInfo = ref({
    take: 10,
    skip: 0,
});
const page = ref(1);
const q = ref('');

const { data } = await useFetch<IPaginatedResponse<IUserShort>>('/api/users/list', {
    query: {
        companyId: userStore.user?.companyId,
        take: pageInfo.value.take,
        skip: pageInfo.value.take * (page.value - 1),
        q: q,
    },
});

const isVisible = computed<boolean>(() => {
    return userStore.isOwner || userStore.isManager;
});
const roles = Object.keys(EUserRole);

function isDisabled(role: string) {
    return userStore.isManager && role === EUserRole.OWNER;
}

function removeByEmail(email: string) {
    if (!email) return;

    try {
        $fetch('/api/users/list', {
            query: { email },
        });
    } catch (e) {
        console.warn('Company / removeByEmail: ', e);
    }
}
</script>

<template>
    <UPageCard
        v-if="data?.count"
        variant="subtle"
        :ui="{
            container: 'p-0 sm:p-0 gap-y-0',
            wrapper: 'items-stretch',
            header: 'p-4 mb-0 border-b border-default',
        }"
    >
        <template #header>
            <UInput
                v-model="q"
                icon="i-lucide-search"
                placeholder="Search members"
                class="w-full"
            />
        </template>

        <ul
            role="list"
            class="divide-y divide-default"
        >
            <li
                v-for="user in data.results"
                :key="user.id"
                class="flex items-center justify-between gap-3 py-3 px-4 sm:px-6"
            >
                <div class="flex items-center gap-3 min-w-0">
                    <UAvatar
                        :src="user.image || ''"
                        :alt="user.name || ''"
                        size="md"
                    />

                    <div class="text-sm min-w-0">
                        <p class="text-highlighted font-medium truncate">
                            {{ user.name }}
                        </p>
                        <p class="text-muted truncate">
                            {{ user.email }}
                        </p>
                    </div>
                </div>

                <div class="flex items-center gap-3">
                    <USelect
                        v-if="isVisible"
                        :disabled="isDisabled(user.role)"
                        :model-value="user.role"
                        :items="roles"
                        color="neutral"
                        :ui="{ value: 'capitalize', item: 'capitalize' }"
                    />

                    <UTooltip text="Remove employee">
                        <UButton
                            v-if="isVisible"
                            :disabled="isDisabled(user.role)"
                            icon="i-lucide-trash"
                            color="error"
                            variant="ghost"
                            @click="removeByEmail(user.email)"
                        />
                    </UTooltip>
                </div>
            </li>
        </ul>
    </UPageCard>
</template>
