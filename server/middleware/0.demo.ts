/**
 * Демо-режим. Имя с «0.» — чтобы отработать раньше auth-мидлвары.
 *
 * 1. `?mode=preview` — ставим куку `demo` и уводим на дашборд (после редиректа
 *    у запросов уже есть кука, включая SSR-подзапросы, которые пробрасывают cookie).
 * 2. Для демо-сессии ЛЮБЫЕ запросы к `/api/**` (кроме auth) проксируем на копию в
 *    `server/routes/preview/**` — без БД. И чтение (GET), и мутации: так не нужно
 *    перехватывать `$csrfFetch` на клиенте (nuxt-csurf отдаёт его non-configurable
 *    getter'ом — переопределить нельзя). csurf на /preview пропускаем, пробрасывая
 *    исходный заголовок `csrf-token` и cookie во внутренний вызов.
 */
export default defineEventHandler(async (event) => {
    const url = getRequestURL(event);

    if (url.searchParams.get('mode') === 'preview') {
        setCookie(event, 'demo', '1', { path: '/', sameSite: 'lax' });

        return sendRedirect(event, '/dashboard', 302);
    }

    if (getCookie(event, 'demo') !== '1') return;

    const path = event.path.split('?')[0] || '';

    if (!path.startsWith('/api/')) return;
    if (path.startsWith('/api/auth/') || path.startsWith('/api/_auth/')) return;

    const previewPath = `/preview${path.slice('/api'.length)}`;

    // Заголовки для внутреннего вызова: cookie (сессия csurf) и парный csrf-token,
    // чтобы csurf на /preview пропустил защищённые методы (POST/PUT/PATCH).
    const headers: Record<string, string> = { cookie: getHeader(event, 'cookie') || '' };
    const csrfToken = getHeader(event, 'csrf-token');

    if (csrfToken) headers['csrf-token'] = csrfToken;

    // Явный дженерик + string-путь обрывают глубокий вывод типов маршрутов Nitro.
    if (event.method === 'GET') {
        return await $fetch<unknown>(previewPath as string, {
            query: getQuery(event),
            headers,
        });
    }

    // Тело читаем здесь и пробрасываем во внутренний запрос.
    const body = await readBody(event).catch(() => undefined);

    const result = await $fetch<unknown>(previewPath as string, {
        method: event.method as 'POST' | 'PUT' | 'PATCH' | 'DELETE',
        query: getQuery(event),
        headers,
        body,
    });

    // Пустой ответ (например, 204 у DELETE) вернул бы undefined, а undefined из мидлвары
    // h3 трактует как «не обработано» и пускает запрос дальше на auth → 401. Отдаём явное
    // значение, чтобы запрос завершился здесь.
    return result ?? '';
});
