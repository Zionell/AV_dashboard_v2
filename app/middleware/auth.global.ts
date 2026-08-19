export default defineNuxtRouteMiddleware((to, from) => {
    if (!to.matched.length) return;

    const userStore = useUserStore();
    const user = userStore.user;
    const redirectUrl: string = from.query?.redirectUrl?.toString() || '';

    if (!user) {
        if (to.path !== ERoutes.INDEX) {
            return navigateTo(`${ERoutes.INDEX}?redirectUrl=${to.fullPath}`);
        }
        return;
    }

    const onboarded = Boolean(user.companyId);

    if (!onboarded) {
        if (to.path !== ERoutes.LOGIN_NEW) {
            return navigateTo(ERoutes.LOGIN_NEW);
        }
        return;
    }

    if (to.path === ERoutes.INDEX || to.path === ERoutes.LOGIN_NEW) {
        return navigateTo(redirectUrl || ERoutes.DASHBOARD);
    }
});
