const exclude: string[] = [];

export default defineNuxtRouteMiddleware(async (to, from) => {
    const toPath: string = to.path;
    const fromPath: string = from.fullPath;
    const redirectUrl: string = from.query?.redirectUrl?.toString() || '';

    const isExcluded = exclude.find((ex) => toPath.includes(ex));

    if (isExcluded) {
        return;
    }

    const userStore = useUserStore();

    if (userStore.user && toPath === ERoutes.INDEX) {
        return navigateTo(redirectUrl || ERoutes.DASHBOARD);
    }

    if (!userStore.user && toPath !== ERoutes.INDEX) {
        return navigateTo(`${ERoutes.INDEX}?redirectUrl=${fromPath}`);
    }
});
