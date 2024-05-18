<script setup lang="ts">
import type {Company} from '@prisma/client';
import {useUserStore} from '~/store/user';
import {copyToClipboard, encrypt} from '~/utils/utils';
import type {TableSortType} from '~/types';

const userStore = useUserStore();

const isCopied = ref<boolean>(false);
const timer = ref<ReturnType<typeof setTimeout> | null>(null);
const columns = ref([
	{
		key: 'name',
		label: 'ФИО',
		sortable: true,
	},
	{
		key: 'email',
		label: 'Email',
	},
	{
		key: 'role',
		label: 'Должность',
	},
	{
		key: 'actions',
	},
]);
const pageInfo = ref({
	take: 10,
	skip: 0,
});
const page = ref(1);
const sort = ref<TableSortType>({
	column: 'name',
	direction: 'desc',
});
const q = ref('');

const { data } = await useAsyncData(async () => {
	const company = await $fetch('/api/company', {
		params: {
			id: userStore.getCompanyId,
		},
	});

	return { company };
});
const { pending, data: usersInfo } = await useLazyAsyncData(
	() => {
		return $fetch('/api/users/list', {
			query: {
				companyId: userStore.getCompanyId,
				take: pageInfo.value.take,
				skip: pageInfo.value.take * (page.value - 1),
				order: sort.value.direction,
				q: q.value,
			},
		});
	},
	{ watch: [page, sort, q] },
);

const companyInfo = computed((): Company | null => {
	if (data.value?.company) {
		return data.value.company;
	}
	return null;
});
const isHasCompany = computed(() => {
	return !!userStore.getCompanyId;
});
const tooltipText = computed(() =>
	isCopied.value
		? 'Скопировано'
		: 'Нажмите, чтобы скопировать ссылку приглашение',
);
const usersPrepared = computed(() => {
	const users = usersInfo.value?.users || [];
	if (!Array.isArray(users) || !users.length) {
		return [];
	}
	return users.map(u => ({
		name: u.name || '-',
		email: u.email || '-',
		role: u.role || '-',
	}));
});
const isVisible = computed<boolean>(() => {
	if (!userStore.user?.role) {
		return false;
	}
	const role = userStore.user?.role
	return ['MANAGER', 'OWNER'].includes(role);
});

const copyLink = async () => {
	if (timer.value) {
		clearTimeout(timer.value);
	}
	const q = await encrypt(String(userStore.getCompanyId));
	const domain = document.location.origin;
	const link = `${domain}/invite/?q=${q}`;
	copyToClipboard(link);
	isCopied.value = true;
	timer.value = setTimeout(() => {
		isCopied.value = false;
	}, 300);
};
const items = (email: string) => [
	[
		{
			label: 'Удалить из компании',
			icon: 'i-heroicons-trash-20-solid',
			click: () => removeByEmail(email),
		},
	],
];
const removeByEmail = (email: string) => {
	try {
		$fetch('/api/users/list', {
			query: { email },
		});
	}
	catch (e) {
		console.warn('Company / removeByEmail: ', e);
	}
};
</script>

<template>
	<section class="h-full">
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
					<br>
					Чтобы продолжить пользоваться функционалом, пожалуйста,
					создайте компанию.
				</div>
				<CompanyAddNew />
			</article>
			<article v-else>
				<h3 class="text-xl font-black mb-6">
					Название компании: {{ companyInfo?.name }}
				</h3>
				<div class="border border-orange-400 rounded-lg mb-4">
					<div class="flex px-3 py-3.5">
						<UInput
							v-model="q"
							placeholder="Поиск по имени"
							color="orange"
							size="lg"
						/>
					</div>

					<UTable
						v-if="usersPrepared.length"
						v-model:sort="sort"
						sort-mode="manual"
						:rows="usersPrepared"
						:loading="pending"
						:progress="{ color: 'orange', animation: 'carousel' }"
						:ui="{
							divide: 'divide-y divide-orange-400',
						}"
						:columns="columns"
						:empty-state="{
							icon: 'i-heroicons-circle-stack-20-solid',
							label: 'Участников не найдено',
						}"
					>
						<template #actions-data="{ row }">
							<UDropdown :items="items(row.email)">
								<UButton
									color="gray"
									variant="ghost"
									icon="i-heroicons-ellipsis-horizontal-20-solid"
								/>
							</UDropdown>
						</template>
					</UTable>

					<div
						class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700"
					>
						<UPagination
							v-model="page"
							:page-count="pageInfo.take"
							:total="usersInfo?.count || 10"
						/>
					</div>
				</div>

				<UFormGroup
					v-if="isVisible"
					label="Пригласить пользователя"
					class="border border-orange-400 rounded-lg mb-4 px-3 py-3.5"
				>
					<UTooltip :text="tooltipText">
						<UButton
							class="mt-4"
							size="lg"
							color="orange"
							@click="copyLink"
						>
							По ссылке
						</UButton>
					</UTooltip>
				</UFormGroup>
			</article>
		</transition>
	</section>
</template>
