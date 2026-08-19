import type { RouteLocationNormalized } from 'vue-router';
import { DEMO_MODE_PARAM, DEMO_MODE_VALUE } from '#shared/constants';

/** Тот же адрес без метки демо — чтобы после входа она не осталась в строке браузера. */
function withoutDemoMark(to: RouteLocationNormalized) {
    const { [DEMO_MODE_PARAM]: _mode, redirectUrl: _redirectUrl, ...query } = to.query;

    return { path: to.path, query, hash: to.hash };
}

/**
 * Вход в демо по ссылке `/?mode=demo`: креды тестового пользователя лежат в публичном
 * конфиге, логин делает браузер обычным запросом на /api/auth/login.
 *
 * Почему не на сервере: сессию ставит Set-Cookie ответа, а при SSR этот ответ осел бы
 * внутри рендера и до браузера не дошёл. Поэтому на сервере мидлвар только уводит
 * глубокую ссылку (`/tasks?mode=demo`) на корень, сохранив цель в redirectUrl, — иначе
 * auth.global.ts успел бы отправить гостя на страницу входа и метка demo потерялась бы.
 *
 * Номер в имени файла задаёт порядок: глобальные мидлвары идут по алфавиту, «00.» ставит
 * демо-вход перед auth.global.ts.
 */
export default defineNuxtRouteMiddleware(async (to) => {
    if (!to.matched.length) return;
    if (to.query[DEMO_MODE_PARAM] !== DEMO_MODE_VALUE) return;

    const userStore = useUserStore();
    const router = useRouter();
    const isIndex = to.path === ERoutes.INDEX;

    if (import.meta.server) {
        if (userStore.user || isIndex) return;

        return navigateTo({
            path: ERoutes.INDEX,
            query: {
                [DEMO_MODE_PARAM]: DEMO_MODE_VALUE,
                redirectUrl: router.resolve(withoutDemoMark(to)).fullPath,
            },
        });
    }

    // Куда попадём после входа: с корня — на дашборд или в отложенную цель, с остальных
    // страниц — на них же.
    const target = isIndex
        ? to.query.redirectUrl?.toString() || ERoutes.DASHBOARD
        : router.resolve(withoutDemoMark(to)).fullPath;

    // Уже вошли (в том числе своей учёткой) — чужую сессию не перебиваем, просто чистим адрес.
    if (userStore.user) return leaveTo(target);

    const { demo } = useRuntimeConfig().public;

    if (!demo.email || !demo.password) {
        console.warn('demo middleware: креды демо-пользователя не заданы');
        return;
    }

    const { $csrfFetch } = useNuxtApp();

    try {
        await $csrfFetch('/api/auth/login', {
            method: 'POST',
            body: { email: demo.email, password: demo.password },
        });
    } catch (e) {
        // Дальше не мешаем: гостя подхватит auth.global.ts и уведёт на обычный вход.
        console.error('demo middleware / login: ', e);
        return;
    }

    return leaveTo(target);
});

/**
 * Уход с демо-ссылки перезагрузкой, а не роутером. Причин две: сервер отрисует целевую
 * страницу, уже видя куку сессии (иначе её данные грузились бы вторым заходом с клиента),
 * и не будет расхождения гидратации — SSR отдал страницу входа, а клиент к этому моменту
 * показывает уже другую.
 *
 * `replace` — чтобы «назад» не возвращало на ссылку с меткой и не запускало вход заново.
 */
function leaveTo(url: string) {
    window.location.replace(url);

    // Текущая навигация больше не нужна: браузер уходит на новый адрес.
    return false;
}
