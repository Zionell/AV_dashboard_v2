<script setup lang="ts">
import { format, isToday, isYesterday } from 'date-fns';
import type { IMember } from '#shared/types/user';
import type { IPaginatedResponse } from '#shared/types';

const userStore = useUserStore();
const { $csrfFetch } = useNuxtApp();
const toast = useToast();

const take = 10;
const page = ref(1);
const q = ref('');
const skip = computed(() => take * (page.value - 1));

const { data, refresh } = await useFetch<IPaginatedResponse<IMember>>('/api/users/list', {
    query: {
        take,
        skip,
        q,
    },
});

// Смена ролей и удаление участников — только owner; менеджер видит список.
const canEditMembers = computed<boolean>(() => userStore.isOwner);
const roles = Object.keys(EUserRole);

function isSelf(id: string) {
    return userStore.user?.id === id;
}

function formatJoined(date: string) {
    return format(new Date(date), 'MMM dd yyyy');
}

function formatLastActive(date: string) {
    const d = new Date(date);

    if (isToday(d)) return `Today, ${format(d, 'HH:mm')}`;
    if (isYesterday(d)) return `Yesterday, ${format(d, 'HH:mm')}`;

    return format(d, 'MMM dd yyyy');
}

async function changeRole(user: IMember, role: string) {
    try {
        await $csrfFetch(`/api/users/${user.id}/role`, {
            method: 'PATCH',
            body: { role },
        });
        await refresh();
    } catch (e) {
        toast.add({
            title: 'Error',
            description: (e as { data?: { message?: string } })?.data?.message || 'Failed to change role',
            color: 'error',
        });
    }
}

async function removeMember(user: IMember) {
    try {
        await $csrfFetch(`/api/users/${user.id}`, {
            method: 'DELETE',
        });
        await refresh();
    } catch (e) {
        toast.add({
            title: 'Error',
            description: (e as { data?: { message?: string } })?.data?.message || 'Failed to remove member',
            color: 'error',
        });
    }
}
</script>

<template>
    <UPageCard
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
                placeholder="Search members..."
                class="w-full"
            />
        </template>

        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="text-left text-muted border-b border-default">
                        <th class="font-medium py-3 px-4 sm:px-6">Member</th>
                        <th class="font-medium py-3 px-4">Role</th>
                        <th class="font-medium py-3 px-4">Joined</th>
                        <th class="font-medium py-3 px-4">Last Active</th>
                        <th class="font-medium py-3 px-4">Time This Week</th>
                        <th
                            v-if="canEditMembers"
                            class="font-medium py-3 px-4"
                        >
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-default">
                    <tr
                        v-for="user in data?.results"
                        :key="user.id"
                    >
                        <td class="py-3 px-4 sm:px-6">
                            <div class="flex items-center gap-3 min-w-0">
                                <UAvatar
                                    :src="user.image || ''"
                                    :alt="user.name || ''"
                                    size="md"
                                />
                                <div class="min-w-0">
                                    <p class="text-highlighted font-medium truncate">
                                        {{ user.name }}
                                    </p>
                                    <p class="text-muted truncate">
                                        {{ user.email }}
                                    </p>
                                </div>
                            </div>
                        </td>
                        <td class="py-3 px-4">
                            <USelect
                                v-if="canEditMembers"
                                :model-value="user.role"
                                :items="roles"
                                color="neutral"
                                :ui="{ value: 'capitalize', item: 'capitalize' }"
                                @update:model-value="changeRole(user, $event)"
                            />
                            <UBadge
                                v-else
                                color="neutral"
                                variant="subtle"
                                class="capitalize"
                            >
                                {{ user.role }}
                            </UBadge>
                        </td>
                        <td class="py-3 px-4 whitespace-nowrap">{{ formatJoined(user.createdAt) }}</td>
                        <td class="py-3 px-4 whitespace-nowrap">{{ formatLastActive(user.updatedAt) }}</td>
                        <td class="py-3 px-4 whitespace-nowrap">{{ formatDuration(user.timeWeekMs) }}</td>
                        <td
                            v-if="canEditMembers"
                            class="py-3 px-4"
                        >
                            <UTooltip
                                v-if="!isSelf(user.id)"
                                text="Remove employee"
                            >
                                <UButton
                                    icon="i-lucide-trash"
                                    color="error"
                                    variant="ghost"
                                    @click="removeMember(user)"
                                />
                            </UTooltip>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="flex items-center justify-between p-4 border-t border-default">
            <p class="text-sm text-muted">
                Showing {{ data?.count ? skip + 1 : 0 }}–{{ Math.min(skip + take, data?.count || 0) }} of
                {{ data?.count || 0 }} members
            </p>
            <UPagination
                v-model:page="page"
                :total="data?.count || 0"
                :items-per-page="take"
            />
        </div>
    </UPageCard>
</template>
