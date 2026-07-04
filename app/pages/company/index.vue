<script setup lang="ts">
import { useUserStore } from '~/stores/user';
import type { Company } from '~~/generated/prisma';

const userStore = useUserStore();

const { data, refresh } = await useFetch('/api/company', {
    params: {
        id: userStore.user?.companyId,
    },
});

const companyInfo = computed((): Company | null => {
    if (data.value) {
        return data.value;
    }
    return null;
});

const isHasCompany = computed(() => {
    return !!userStore.user?.companyId;
});
</script>

<template>
    <UDashboardPanel id="company">
        <template #header>
            <UDashboardNavbar
                title="Company"
                :ui="{ right: 'gap-3' }"
            >
                <template #right> </template>
            </UDashboardNavbar>

            <UDashboardToolbar class="py-6">
                <template #left>
                    <CurrentDate />
                </template>
            </UDashboardToolbar>
        </template>

        <template #body>
            <transition
                name="fade"
                mode="out-in"
            >
                <article
                    v-if="!isHasCompany"
                    class="flex items-center justify-center flex-col h-full"
                >
                    <div class="text-xl text-center font-bold mb-6">
                        Извините, но ваша компания не создана в нашем приложении.
                        <br />
                        Чтобы продолжить пользоваться функционалом, пожалуйста, создайте компанию.
                    </div>
                    <AddNewCompany @refresh="refresh" />
                </article>

                <article v-else>
                    <UPageCard
                        :title="`Company name: ${companyInfo?.name}`"
                        variant="naked"
                        orientation="horizontal"
                        class="mb-4"
                    >
                        <UButton
                            v-if="userStore.isOwner"
                            label="Invite people"
                            class="w-fit lg:ms-auto"
                        />
                    </UPageCard>

                    <MembersList />
                </article>
            </transition>
        </template>
    </UDashboardPanel>
</template>
