<template>
	<main
		class="flex items-center justify-center min-h-screen bg-white text-black font-custom"
	>
		<section class="p-6 rounded-3xl bg-stone-100 shadow-inner">
			<slot />
		</section>
		<UNotifications />
	</main>
</template>
