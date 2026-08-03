import { describe, it, expect } from 'vitest';
import { formatBytes, planSummary } from '#shared/utils/format';
import { COMPANY_PLANS, ECompanyPlan } from '#shared/types/company';

const GB = 1024 ** 3;

describe('formatBytes', () => {
    it.each([
        [0, '0 B'],
        [70, '70 B'],
        [999, '999 B'],
        [1024, '1 KB'],
        [1536, '1.5 KB'],
        [1048576, '1 MB'],
        [GB, '1 GB'],
        [3 * GB, '3 GB'],
        [10 * GB, '10 GB'],
        [1024 ** 4, '1 TB'],
    ])('%i → %s', (bytes, expected) => {
        expect(formatBytes(bytes)).toBe(expected);
    });

    it('округление не выталкивает значение за пределы разряда', () => {
        // 1073741774 байт это 1023.99995 MB. Наивная реализация показывала
        // «1024.0 MB» при лимите «1 GB» — выглядело как перебор там, где его нет.
        expect(formatBytes(GB - 50)).toBe('1.0 GB');
        expect(formatBytes(GB - 50)).not.toContain('MB');
    });

    it('отрицательные и мусорные значения не ломают вывод', () => {
        expect(formatBytes(-1)).toBe('0 B');
        expect(formatBytes(NaN)).toBe('0 B');
    });
});

describe('planSummary', () => {
    it('описывает тариф одной строкой', () => {
        expect(planSummary(COMPANY_PLANS[ECompanyPlan.PRO])).toBe('5 members · 5 projects · 3 GB');
    });

    it('единственное число для тарифа на одного', () => {
        expect(planSummary(COMPANY_PLANS[ECompanyPlan.FREE])).toBe('1 member · 3 projects · 1 GB');
    });
});
