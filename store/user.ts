import { defineStore } from 'pinia';
import type { UserMeType } from '~/types/user';

export const useUserStore = defineStore('user', {
	state: (): { user: UserMeType | null } => ({
		user: null,
	}),

	getters: {
		getUser: state => state.user,
		getUserId: state => state.user?.id,
		getCompanyId: state => state.user?.companyId,
	},

	actions: {
		async setUser(headers: Readonly<Record<string, string>>) {
			try {
				const user = await $fetch('/api/users/me', { headers });

				if (user) {
					this.user = { ...user };
				}
			}
			catch (e) {
				console.warn('User store / setUser: ', e);
			}
		},
	},
});
