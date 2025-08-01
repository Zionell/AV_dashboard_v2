<template>
	<div
		class="grid layoutRows layoutColumns min-h-screen bg-white text-black font-custom overflow-hidden"
	>
		<LayoutHeader />
		<LayoutNavBar class="col-start-1 row-start-1 row-end-3" />

		<main class="bg-stone-100 p-6 rounded-tl-3xl shadow-inner">
			<slot />
		</main>
	</div>
</template>
