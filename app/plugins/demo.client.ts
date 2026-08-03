/**
 * Демо-режим на клиенте: только выставляем куку `demo` при входе через SPA-навигацию
 * (?mode=preview без полной перезагрузки). Всю подмену `/api/** → /preview/**` для всех
 * методов (чтение и мутации) делает серверная мидлвара 0.demo — без завязки на порядок
 * плагинов и без перехвата $csrfFetch (nuxt-csurf отдаёт его non-configurable getter'ом,
 * переопределить нельзя).
 */
export default defineNuxtPlugin(() => {
    const demo = useCookie('demo', { path: '/' });

    if (new URLSearchParams(window.location.search).get('mode') === 'preview') {
        demo.value = '1';
    }
});
