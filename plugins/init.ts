import { defineNuxtPlugin, useRequestHeaders } from 'nuxt/app';
import { useDomainStore } from '~/store/domain';
import { useUserStore } from '~/store/user';

export default defineNuxtPlugin(async (): Promise<void> => {
	try {
		const headers = useRequestHeaders();
		const domainStore = useDomainStore();
		const userStore = useUserStore();

		await Promise.all([
			domainStore.init(headers),
			userStore.setUser(headers),
		]);
	}
	catch (e) {
		console.warn(e);
	}
});
