<script setup lang="ts">
import type { IProjectMemberStat } from '#shared/types/projects';

const props = defineProps<{
    members: IProjectMemberStat[];
}>();
</script>

<template>
    <BlockWrapper
        title="Team Members"
        :is-empty="!props.members.length"
    >
        <ul class="divide-y divide-default">
            <li
                v-for="member in props.members"
                :key="member.id"
                class="flex items-center gap-3 py-3 px-4"
            >
                <UAvatar
                    :src="member.image || ''"
                    :alt="member.name || ''"
                    size="sm"
                />
                <div class="min-w-0 grow">
                    <p class="text-sm font-medium text-highlighted truncate">{{ member.name }}</p>
                    <p class="text-xs text-muted capitalize">{{ member.role.toLowerCase() }}</p>
                </div>
                <div class="flex gap-4 text-center shrink-0">
                    <div>
                        <p class="text-[10px] text-muted uppercase">Today</p>
                        <p class="text-xs font-medium">{{ formatDuration(member.todayMs) }}</p>
                    </div>
                    <div>
                        <p class="text-[10px] text-muted uppercase">Week</p>
                        <p class="text-xs font-medium">{{ formatDuration(member.weekMs) }}</p>
                    </div>
                    <div>
                        <p class="text-[10px] text-muted uppercase">Tasks</p>
                        <p class="text-xs font-medium">{{ member.tasksCount }}</p>
                    </div>
                </div>
            </li>
        </ul>
    </BlockWrapper>
</template>
