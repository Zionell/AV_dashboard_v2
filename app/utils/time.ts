import { round1 } from '#shared/utils/format';

/** 228000000 → "63h 20m" */
export function formatDuration(ms: number): string {
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (!hours) return `${minutes}m`;

    return `${hours}h ${minutes ? `${minutes}m` : ''}`.trim();
}

/** Изменение к предыдущему периоду в процентах; null — если сравнивать не с чем. */
export function deltaPercent(current: number, previous: number): number | null {
    if (!previous) return null;

    return round1(((current - previous) / previous) * 100);
}
