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
    const isEmployee = computed((): boolean => state.user?.role === EUserRole.EMPLOYEE);
    const canManageContent = computed((): boolean => isOwner.value || isManager.value);

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
        isEmployee,
        canManageContent,
        fetchUser,
        updateUser,
    };
});
