import { defineStore } from 'pinia';
import { EUserRole, type IUserMe } from '#shared/types/user';

interface IState {
    user: IUserMe | null;
}

export const useUserStore = defineStore('user', () => {
    const state = reactive<IState>({
        user: null,
    });

    const isOwner = computed((): boolean => state.user?.role === EUserRole.OWNER);
    const isManager = computed((): boolean => state.user?.role === EUserRole.MANAGER);

    async function fetchUser() {
        try {
            const headers = useRequestHeaders(['cookie']);

            const user = await $fetch<IUserMe>('/api/users/me', {
                headers,
            });

            if (user) {
                state.user = { ...user };
            }
        } catch (e) {
            console.warn('User store / setUser: ', e);
        }
    }

    function updateUser(user: IUserMe) {
        state.user = user;
    }

    return {
        ...toRefs(state),
        isOwner,
        isManager,
        fetchUser,
        updateUser,
    };
});
