import { isAuthPath, isMutatingMethod } from '#shared/utils/http';
import { READONLY_HINT } from '#shared/constants';

/**
 * Ошибка формой, привычной для компонентов: они читают `e.data.message`, поэтому
 * заблокированный запрос объяснит себя там же, где обычно показывается ответ сервера.
 */
class ReadonlyModeError extends Error {
    statusCode = 403;
    data = { message: READONLY_HINT };

    constructor() {
        super(READONLY_HINT);
        this.name = 'ReadonlyModeError';
    }
}

/**
 * Страховка для демо-роли: гасит запись на клиенте, не доводя до сервера.
 *
 * Основной запрет — серверный, он же единственный настоящий. Этот перехватчик нужен на
 * случай контрола, которому забыли проставить disabled: пользователь увидит объяснение,
 * а не молчаливую 403 где-то в консоли.
 */
export default defineNuxtPlugin((nuxtApp) => {
    const userStore = useUserStore();

    globalThis.$fetch = $fetch.create({
        onRequest({ request, options }) {
            if (!userStore.isReadonly) return;

            const url = typeof request === 'string' ? request : request.url;
            const method = String(options.method ?? 'GET');

            if (!url.startsWith('/api/')) return;
            // Вход и выход обязаны работать в любой роли.
            if (isAuthPath(url)) return;
            if (!isMutatingMethod(method)) return;

            // Тост здесь, а не только в компонентах: часть из них показывает свой
            // обобщённый текст вроде «Failed to save», по которому причину не понять.
            //
            // runWithContext обязателен: хук срабатывает во время запроса, вне setup, —
            // без него useToast() не находит приложение и уведомление молча не появляется.
            nuxtApp.runWithContext(() => useToast().add({ title: READONLY_HINT, color: 'neutral' }));

            throw new ReadonlyModeError();
        },
    });
});
