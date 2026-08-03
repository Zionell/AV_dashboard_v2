import { createError } from 'h3';

/**
 * В рантайме Nitro автоимпортирует createError в server/**, поэтому в коде он
 * используется без импорта. В тестах подкладываем настоящий из h3 — так у ошибок
 * будет реальный statusCode, и проверки кодов не превратятся в фикцию.
 */
declare global {
    var createError: typeof import('h3').createError;
}

globalThis.createError = createError;
