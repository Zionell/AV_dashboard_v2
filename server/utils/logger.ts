import { consola } from 'consola';

/**
 * Единый серверный логгер. Экспорт из server/utils автоимпортится в Nitro,
 * поэтому в эндпоинтах и утилитах `logger` доступен без импорта.
 */
export const logger = consola.withTag('api');
