<script setup lang="ts">
import { useUserStore } from '~/store/user';
import type { IProject } from '~/types/projects';

type PropsType = {
	project: IProject;
};

const props = withDefaults(defineProps<PropsType>(), {
	project: () => ({}) as IProject,
});

const emit = defineEmits(['refresh']);

const userStore = useUserStore();
const toast = useToast();
const isLoading = ref<boolean>(false);
const isRemoving = ref<boolean>(false);

const projectProgress = computed((): number => {
	const allTodos = props.project.todo.length;
	const completed = props.project.todo.filter(t => t.isCompleted).length;

	const progress = (completed * 100) / allTodos;
	return progress || 0;
});
const color = computed(() => {
	if (projectProgress.value < 20) return 'red';
	if (projectProgress.value < 60) return 'orange';
	return 'green';
});
const isActive = computed(() => props.project.users[0].isCurrent);
const users = computed(() => props.project.users.map(u => u.user));
const imageUrl = computed(() => {
	return props.project.imgUrl || '/images/default-project.svg';
});

const setCurrent = async () => {
	try {
		isLoading.value = true;

		await $fetch('/api/projects/current', {
			method: 'PUT',
			query: {
				id: props.project.id,
				userId: userStore.getUserId,
			},
		});
		toast.add({
			title: `Проект ${props.project.name} успешно выбран!`,
			id: 'modal-success',
			color: 'orange',
		});
		emit('refresh');
	}
	catch (e) {
		console.warn('Project card/ setCurrent: ', e);
	}
	finally {
		isLoading.value = false;
	}
};
const remove = async () => {
	try {
		isRemoving.value = true;

		await $fetch('/api/projects', {
			method: 'DELETE',
			query: {
				id: props.project.id,
			},
		});
		toast.add({
			title: `Проект ${props.project.name} успешно удален!`,
			id: 'modal-success',
			color: 'orange',
		});
		emit('refresh');
	}
	catch (e) {
		console.warn('Project card/ remove: ', e);
	}
	finally {
		isRemoving.value = false;
	}
};
</script>

<template>
	<UCard
		:ui="{
			header: {
				padding: 'sm:p-3',
			},
			body: {
				padding: 'sm:p-3',
			},
			footer: {
				base: 'flex flex-wrap gap-2',
				padding: 'sm:p-3',
			},
		}"
	>
		<template #header>
			<div class="flex items-center justify-between">
				<h3 class="text-xl">
					{{ project.name }}
				</h3>
				<UBadge v-if="isActive">
					Активный
				</UBadge>
			</div>
		</template>

		<div class="grid grid-cols-2 gap-3 h-80">
			<nuxt-img
				class="h-full object-contain"
				:src="imageUrl"
				placeholder
				:alt="`Проект: ${project.name}`"
				loading="lazy"
			/>
			<div class="flex flex-col gap-4">
				<UFormGroup label="Прогресс">
					<UProgress
						:value="projectProgress"
						:color="color"
					/>
				</UFormGroup>
				<UFormGroup label="Участники">
					<ul class="h-full custom__scroll">
						<li
							v-for="user in users"
							:key="user.id"
							class="grid grid-cols-[2fr_1fr] gap-2 mb-3 text-sm items-center border border-orange-400 p-2 rounded-xl"
						>
							<div class="grow">
								{{ user.name }}
							</div>
							<p class="participants__item-time fs-14">
								{{ user?.role }}
							</p>
						</li>
					</ul>
				</UFormGroup>
			</div>
		</div>

		<template #footer>
			<UButton
				size="xs"
				color="orange"
				:loading="isLoading"
				@click="setCurrent"
			>
				Выбрать
			</UButton>
			<UButton
				size="xs"
				color="orange"
				target="_blank"
				:to="project.gitHub"
				:disabled="!project.gitHub"
			>
				GitHUB
			</UButton>
			<UButton
				size="xs"
				color="orange"
				target="_blank"
				:to="project.designUrl"
				:disabled="!project.designUrl"
			>
				Ссылка на макет
			</UButton>
			<UButton
				size="xs"
				color="orange"
				target="_blank"
				:to="project.projectUrl"
				:disabled="!project.projectUrl"
			>
				Ссылка на проект
			</UButton>
			<UButton
				size="xs"
				color="orange"
				square
				variant="solid"
				:loading="isRemoving"
				@click="remove"
			>
				<template #trailing>
					<svgo-delete class="w-4 h-4" />
				</template>
			</UButton>
		</template>
	</UCard>
</template>
