import type { H3Event } from 'h3';
import { dbClient } from '~~/lib/dbClient';
import type { EProjectEventType } from '#shared/types/projects';

interface IRecordEvent {
    type: EProjectEventType;
    projectId: string;
    actorId?: string | null;
    targetName?: string | null;
    meta?: Record<string, string>;
}

/**
 * Пишет событие в ленту проекта.
 * Не блокирует ответ: промис отдаётся в event.waitUntil — Nitro дождётся его после отправки
 * ответа (в serverless пробросит в waitUntil платформы). Ошибка записи не роняет основной запрос.
 */
export function recordEvent(event: H3Event, { type, projectId, actorId, targetName, meta }: IRecordEvent) {
    const promise = dbClient.event
        .create({
            data: {
                type,
                projectId,
                actorId: actorId || null,
                targetName: targetName || null,
                meta: meta || undefined,
            },
        })
        .catch((e) => {
            logger.warn('events/ recordEvent: ', e);
        });

    event.waitUntil(promise);
}
