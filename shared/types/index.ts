export type SortType = 'asc' | 'desc';

export type SpecType = {
    label: string | number;
    value: string | number;
};

export interface IPaginatedResponse<T> {
    results: T[];
    count: number;
}

export const enum EViewType {
    GRID = 'GRID',
    LIST = 'LIST',
}
