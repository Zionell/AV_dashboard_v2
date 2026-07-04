export type Period = 'daily' | 'weekly' | 'monthly';

export interface Range {
    start: Date | string;
    end: Date | string;
}
