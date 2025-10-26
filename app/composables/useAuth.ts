import type { ProvidersType } from "#shared/types/auth";

export default function useAuth() {
	async function signIn(provider: ProvidersType) {
		try {
			switch (provider) {
				case "google":
					window.location.href = "/api/auth/google";
					break;
			}
		} catch (e) {
			console.error("useAuth / loginByGoogle: ", e);
		}
	}

	async function signOut() {
		try {
			await $fetch("/api/auth/logout");
			window.location.href = ERoutes.INDEX;
		} catch (e) {
			console.error("useAuth / signOut: ", e);
		}
	}

	return {
		signIn,
		signOut,
	};
}
