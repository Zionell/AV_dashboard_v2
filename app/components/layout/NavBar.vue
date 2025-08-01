<script setup lang="ts">
import { useUserStore } from "~~/store/user";
import { PAGES } from "~/assets/ts/pages";

const { getCompanyId } = useUserStore();

const mainMenu = computed(() => Object.values(PAGES));

const isDisabled = (val: string): boolean => {
	return (
		(!getCompanyId && !["home", "company", "settings"].includes(val)) ||
		temporaryDisabled.includes(val)
	);
};

const temporaryDisabled = ["settings"];
</script>

<template>
	<div class="grid layoutRows">
		<NuxtLink
			to="/public"
			class="flex items-center justify-center w-full h-auto"
		>
			<UIcon name="i-local-logo" class="h-auto w-3/5 relative z-10" />
		</NuxtLink>

		<nav class="m-6">
			<ul class="flex flex-col gap-4">
				<li
					v-for="(item, ind) in mainMenu"
					:key="ind"
					:class="[
						'group ease-linear',
						{
							'pointer-events-none opacity-50': isDisabled(
								item.value,
							),
						},
					]"
				>
					<NuxtLink
						:to="item.link"
						:active-class="$style.active"
						class="flex items-center px-5 py-4 bg-white text-black rounded-2xl group-hover:bg-gray-100 group-hover:text-orange-400 duration-350"
					>
						<UIcon
							:name="`i-local-${item.value}`"
							class="text-orange-500 mr-8 w-6 h-6 ease-linear group-hover:text-orange-200 duration-300"
						/>
						{{ item.label }}
					</NuxtLink>
				</li>
			</ul>
		</nav>
	</div>
</template>

<style module>
.active {
	background: #000;
	color: #fff;
}
</style>
