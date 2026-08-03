import type { ICompanyPlanLimits } from '#shared/types/company';

const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

/** Округление до одной десятой без хвостовых нулей: 33.333… → 33.3, 25 → 25. */
export function round1(value: number): number {
    return Math.round(value * 10) / 10;
}

/**
 * Байты в человекочитаемый вид: 1536 → «1.5 KB», 1073741824 → «1 GB».
 * Нужен и на сервере (тексты ошибок квоты), и в UI (карточка Storage).
 */
export function formatBytes(bytes: number): string {
    if (!bytes || bytes < 0) return '0 B';

    let exp = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), UNITS.length - 1);
    let value = bytes / 1024 ** exp;

    // Округление может вытолкнуть значение на следующий порядок: 1073741774 байт
    // это 1023.99995 MB, что после toFixed(1) стало бы «1024.0 MB» вместо «1 GB».
    if (value >= 1023.95 && exp < UNITS.length - 1) {
        exp += 1;
        value = bytes / 1024 ** exp;
    }

    // Целые показываем без хвоста: «1 GB», а не «1.0 GB».
    return `${Number.isInteger(value) ? value : value.toFixed(1)} ${UNITS[exp]}`;
}

/**
 * Короткое описание тарифа: «5 members · 5 projects · 3 GB».
 * Используется в онбординге и в модалке смены тарифа — чтобы формулировка
 * не разъезжалась между экранами.
 */
export function planSummary(limits: ICompanyPlanLimits): string {
    return [
        `${limits.seats} ${limits.seats === 1 ? 'member' : 'members'}`,
        `${limits.projects} ${limits.projects === 1 ? 'project' : 'projects'}`,
        formatBytes(limits.storageBytes),
    ].join(' · ');
}
