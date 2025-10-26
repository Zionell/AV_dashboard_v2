<script setup lang="ts"></script>

<template>
	<UDashboardPanel id="home">
		<template #header>
			<UDashboardNavbar title="Home" :ui="{ right: 'gap-3' }">
				<template #right>
					<UTooltip text="Notifications" :shortcuts="['N']">
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
					<div>test</div>
				</template>
			</UDashboardToolbar>
		</template>
	</UDashboardPanel>
</template>
