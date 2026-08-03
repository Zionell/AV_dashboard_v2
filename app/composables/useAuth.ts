import type { ProvidersType } from '#shared/types/auth';

export default function useAuth() {
    const { clear } = useUserSession();

    async function signIn(provider: ProvidersType) {
        switch (provider) {
            case 'google':
                window.location.href = '/api/auth/google/callback';
                break;
        }
    }

    async function signOut() {
        try {
            await clear();
            window.location.href = ERoutes.INDEX;
        } catch (e) {
            console.error('useAuth / signOut: ', e);
        }
    }

    return {
        signIn,
        signOut,
    };
}
