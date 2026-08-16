import { describe, it, expect } from 'vitest';
import { isMutatingMethod, isAuthPath } from '#shared/utils/http';

describe('isMutatingMethod', () => {
    it.each(['GET', 'HEAD', 'OPTIONS', 'get'])('%s — чтение', (method) => {
        expect(isMutatingMethod(method)).toBe(false);
    });

    it.each(['POST', 'PUT', 'PATCH', 'DELETE', 'patch'])('%s — запись', (method) => {
        expect(isMutatingMethod(method)).toBe(true);
    });

    // Неизвестный метод считаем записью: безопаснее ошибиться в сторону запрета.
    it('неизвестный метод — запись', () => {
        expect(isMutatingMethod('TRACE')).toBe(true);
    });
});

describe('isAuthPath', () => {
    // Выход из сессии — это DELETE, то есть мутация. Не отнеси мы его к auth-маршрутам,
    // демо-пользователь не смог бы выйти из аккаунта.
    it.each(['/api/auth/login', '/api/_auth/session'])('%s — маршрут авторизации', (path) => {
        expect(isAuthPath(path)).toBe(true);
    });

    it.each(['/api/todo', '/api/users/me', '/api/authors'])('%s — обычный маршрут', (path) => {
        expect(isAuthPath(path)).toBe(false);
    });
});
