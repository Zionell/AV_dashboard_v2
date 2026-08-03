<script setup lang="ts">
import type { IUserShort } from '#shared/types/user';

interface IProps {
    users: IUserShort[];
}

const props = defineProps<IProps>();

const isEmpty = computed(() => {
    return !props.users.length;
});
</script>

<template>
    <BlockWrapper
        title="Participants"
        :is-empty="isEmpty"
    >
        <ul class="flex flex-col gap-4 h-56 custom__scroll p-4">
            <li
                v-for="user in users"
                :key="user.id"
                class="flex items-center justify-between gap-3"
            >
                <div class="flex items-center gap-3 min-w-0 w-full">
                    <UUser
                        :name="user.name || ''"
                        :description="user.email"
                        :avatar="{
                            src: user.image || '',
                            icon: 'i-lucide-image',
                        }"
                    />
                    <p class="ml-auto text-muted truncate">
                        {{ user.role }}
                    </p>
                </div>
            </li>
        </ul>
    </BlockWrapper>
</template>
