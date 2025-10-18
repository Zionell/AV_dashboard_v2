import { defineStore } from "pinia";
import type { UserMeType } from "#shared/types/user";

interface IState {
	user: UserMeType | null;
}

export const useUserStore = defineStore("user", () => {
	const state = reactive<IState>({
		user: null,
	});

	async function fetchUser() {
		try {
			const user = await $fetch<UserMeType>("/api/users/me");

			if (user) {
				state.user = { ...user };
			}
		} catch (e) {
			console.warn("User store / setUser: ", e);
		}
	}

	return {
		...toRefs(state),
		fetchUser,
	};
});
