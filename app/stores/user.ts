import { defineStore } from 'pinia';
import { EUserRole, type IUserMe } from '#shared/types/user';

interface IState {
    user: IUserMe | null;
}

export const useUserStore = defineStore('user', () => {
    const state = reactive<IState>({
        user: null,
    });

    /**
     * Демо-витрина. Роль приходит настоящей: `/api/users/me` читает пользователя из базы,
     * минуя подмену роли, которую сервер делает для проверки прав на чтение.
     */
    const isTest = computed((): boolean => state.user?.role === EUserRole.TEST);

    /**
     * Режим просмотра: вёрстка рендерится целиком, но всё, что пишет в базу, — неактивно.
     * Настоящий запрет живёт на сервере; здесь только внешний вид.
     */
    const isReadonly = isTest;

    // TEST видит интерфейс как владелец — иначе демо показывало бы урезанный продукт.
    // Благодаря этому все существующие v-if по ролям работают без изменений, а неактивными
    // контролы делает уже isReadonly.
    const isOwner = computed((): boolean => state.user?.role === EUserRole.OWNER || isTest.value);
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
        isTest,
        isReadonly,
        canManageContent,
        fetchUser,
        updateUser,
    };
});
