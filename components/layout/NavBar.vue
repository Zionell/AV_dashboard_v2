<script setup lang="ts">
import { useMenuStore } from '~/store/menu';
import { useUserStore } from '~/store/user';

const { mainMenu } = useMenuStore();
const { getCompanyId } = useUserStore();

const isDisabled = (val: string): boolean => {
	return (!getCompanyId && !['home', 'company', 'settings'].includes(val)) || temporaryDisabled.includes(val);
};

const temporaryDisabled = ['settings'];
</script>

<template>
	<div class="grid grid-rows-layout-row">
		<NuxtLink
			to="/"
			class="flex items-center justify-center w-full h-auto"
		>
			<svgo-logo class="h-auto w-3/5 relative z-10" />
		</NuxtLink>
		<nav class="m-6">
			<ul class="flex flex-col gap-4">
				<li
					v-for="(item, ind) in mainMenu"
					:key="ind"
					:class="['group ease-linear duration-150', { 'pointer-events-none opacity-50': isDisabled(item.value) }]"
				>
					<NuxtLink
						:to="item.link"
						:active-class="$style.active"
						class="flex items-center px-5 py-4 bg-white text-black rounded-2xl group-hover:bg-gray-100 group-hover:text-orange-400"
					>
						<component
							:is="`svgo-${item.value}`"
							class="text-orange-500 mr-8 w-6 h-6 ease-linear duration-150 group-hover:text-orange-200"
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
