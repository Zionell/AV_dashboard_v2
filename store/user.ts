import { defineStore } from "pinia";
import type { UserMeType } from "../types/store/user";

interface IState {
	user: UserMeType | null;
}

export const useUserStore = defineStore("user", () => {
	const state = reactive<IState>({
		user: null,
	});

	async function fetchUser(headers: Readonly<Record<string, string>>) {
		try {
			const { data: user } = await useFetch<UserMeType>("/api/users/me", {
				headers,
			});

			if (user.value) {
				state.user = { ...user.value };
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
