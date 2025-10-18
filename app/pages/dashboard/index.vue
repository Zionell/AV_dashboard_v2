<!--<script setup lang="ts">-->
<!--// import { useUserStore } from "store/user";-->
<!--//-->
<!--// const userStore = useUserStore();-->
<!--//-->
<!--// const { data } = await useAsyncData(async () => {-->
<!--// 	const [materials, users, currentProject, todos] = await Promise.all([-->
<!--// 		$fetch("/api/materials", {-->
<!--// 			query: {-->
<!--// 				companyId: userStore.getCompanyId,-->
<!--// 				take: 15,-->
<!--// 			},-->
<!--// 		}),-->
<!--// 		$fetch("/api/users", {-->
<!--// 			query: {-->
<!--// 				companyId: userStore.getCompanyId,-->
<!--// 				take: 15,-->
<!--// 			},-->
<!--// 		}),-->
<!--// 		$fetch("/api/projects/current", {-->
<!--// 			query: {-->
<!--// 				userId: userStore.getUserId,-->
<!--// 			},-->
<!--// 		}),-->
<!--// 		$fetch("/api/todo", {-->
<!--// 			query: {-->
<!--// 				userId: userStore.getUserId,-->
<!--// 				take: 15,-->
<!--// 			},-->
<!--// 		}),-->
<!--// 	]);-->
<!--// 	const [todosGrouped, todosStatuses, todoProgress] = await Promise.all([-->
<!--// 		$fetch("/api/todo/group", {-->
<!--// 			query: {-->
<!--// 				curProjectId: currentProject?.id,-->
<!--// 			},-->
<!--// 		}),-->
<!--// 		$fetch("/api/todo/status-spec", {-->
<!--// 			query: {-->
<!--// 				curProjectId: currentProject?.id,-->
<!--// 			},-->
<!--// 		}),-->
<!--// 		$fetch("/api/todo/progress", {-->
<!--// 			query: {-->
<!--// 				curProjectId: currentProject?.id,-->
<!--// 			},-->
<!--// 		}),-->
<!--// 	]);-->
<!--//-->
<!--// 	return {-->
<!--// 		materials: materials.material,-->
<!--// 		users,-->
<!--// 		currentProject,-->
<!--// 		todos,-->
<!--// 		todosGrouped,-->
<!--// 		todosStatuses,-->
<!--// 		todoProgress,-->
<!--// 	};-->
<!--// });-->
<!--</script>-->

<!--<template>-->
<!--	<UDashboardPanel id="home">-->
<!--		<div class="flex items-center justify-between">-->
<!--			test-->
<!--			&lt;!&ndash;			<CurrentDate />&ndash;&gt;-->
<!--			&lt;!&ndash;			<HomeStartSession />&ndash;&gt;-->
<!--		</div>-->
<!--		&lt;!&ndash;		<div class="grid grid-cols-3 gap-7">&ndash;&gt;-->
<!--		&lt;!&ndash;			<HomeMyProgress :progress="data?.todoProgress" />&ndash;&gt;-->
<!--		&lt;!&ndash;			<HomeSessionRecording />&ndash;&gt;-->
<!--		&lt;!&ndash;			<HomeCurrentProject :current-project="data?.currentProject" />&ndash;&gt;-->
<!--		&lt;!&ndash;		</div>&ndash;&gt;-->
<!--		&lt;!&ndash;		<div class="grid grid-cols-2 gap-7">&ndash;&gt;-->
<!--		&lt;!&ndash;			<HomeMaterials :items="data?.materials" />&ndash;&gt;-->
<!--		&lt;!&ndash;			<HomeOverallProgress&ndash;&gt;-->
<!--		&lt;!&ndash;				:labels="data?.todosStatuses"&ndash;&gt;-->
<!--		&lt;!&ndash;				:values="data?.todosGrouped"&ndash;&gt;-->
<!--		&lt;!&ndash;			/>&ndash;&gt;-->
<!--		&lt;!&ndash;			<HomeParticipants :users="data?.users" />&ndash;&gt;-->
<!--		&lt;!&ndash;			<HomeToDo :todos="data?.todos" />&ndash;&gt;-->
<!--		&lt;!&ndash;		</div>&ndash;&gt;-->
<!--	</UDashboardPanel>-->
<!--	-->
<!--</template>-->

<template>
	<UDashboardPanel id="home">
		<template #header>
			<UDashboardNavbar title="Home" :ui="{ right: 'gap-3' }">
				<template #right>
					<UTooltip text="Notifications">
						<UButton color="neutral" variant="ghost" square>
							<UChip color="error" inset>
								<UIcon
									name="i-lucide-bell"
									class="size-5 shrink-0"
								/>
							</UChip>
						</UButton>
					</UTooltip>
				</template>
			</UDashboardNavbar>

			<UDashboardToolbar>
				<template #left>
					<!-- NOTE: The `-ms-1` class is used to align with the `DashboardSidebarCollapse` button here. -->
					<!--					<HomeDateRangePicker v-model="range" class="-ms-1" />-->

					<!--					<HomePeriodSelect v-model="period" :range="range" />-->
				</template>
			</UDashboardToolbar>
		</template>

		<template #body>
			<!--			<HomeStats :period="period" :range="range" />-->
			<!--			<HomeChart :period="period" :range="range" />-->
			<!--			<HomeSales :period="period" :range="range" />-->
		</template>
	</UDashboardPanel>
</template>
