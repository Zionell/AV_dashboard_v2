<script setup lang="ts">
definePageMeta({
	pageTransition: {
		name: 'rotate'
	}
})
</script>

<template>
	<div class="">
		settings
		<NuxtPage />
	</div>
</template>
<!-- <template> -->
<!--    <div class="main"> -->
<!--        <div class="main__row"> -->
<!--            <CurrentDate /> -->
<!--        </div> -->
<!--        <div :class="$style['settings-wrap']"> -->
<!--            <SettingsNav /> -->
<!--            <NuxtChild /> -->
<!--        </div> -->
<!--    </div> -->
<!-- </template> -->

<!-- <script> -->
<!-- import CurrentDate from '../../components/old/CurrentDate'; -->
<!-- import SettingsNav from '../../components/old/settings-components/SettingsNav'; -->

<!-- export default { -->
<!--    name: 'SettingsPage', -->
<!--    components: { -->
<!--        CurrentDate, -->
<!--        SettingsNav, -->
<!--    }, -->
<!-- }; -->
<!-- </script> -->

<!-- <style lang="scss" module> -->
<!--    .settings-wrap { -->
<!--        display: grid; -->
<!--        grid-template-columns: 26rem minmax(80rem, 1fr); -->
<!--        gap: 2.5rem; -->
<!--        justify-content: space-between; -->
<!--    } -->
<!-- </style> -->
