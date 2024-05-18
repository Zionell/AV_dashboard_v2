<script setup lang="ts">
definePageMeta({
	auth: false,
	layout: 'auth-layout',
});
</script>

<template>
	<section
		class="grid grid-cols-[2fr_1.5fr] place-items-center gap-16 min-h-screen p-12"
	>
		<nuxt-img
			class="h-full object-contain"
			src="/images/auth-image.png"
			placeholder
			alt="Picture"
			loading="lazy"
		/>
		<AuthForm />
	</section>
</template>
