import { defineNuxtPlugin } from "nuxt/app";

export default defineNuxtPlugin(async (): Promise<void> => {
	try {
		// const headers = useRequestHeaders();
		// const userStore = useUserStore();
		// await Promise.all([userStore.setUser(headers)]);
	} catch (e) {
		console.warn(e);
	}
});
