const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Запись — всё, кроме заведомо безопасных методов. Неизвестный метод считаем записью:
 * ошибиться в сторону запрета дешевле, чем пропустить мутацию.
 */
export function isMutatingMethod(method: string): boolean {
    return !READ_METHODS.has(method.toUpperCase());
}

/**
 * Маршруты входа и сессии. Работают в любой роли: иначе демо-пользователь не смог бы
 * ни войти, ни выйти — выход в nuxt-auth-utils это DELETE /api/_auth/session, то есть
 * с точки зрения метода обычная мутация.
 *
 * Общий список для сервера и клиента, чтобы запрет на запись и его обход не разъехались.
 */
export function isAuthPath(path: string): boolean {
    return path.startsWith('/api/auth/') || path.startsWith('/api/_auth/');
}
