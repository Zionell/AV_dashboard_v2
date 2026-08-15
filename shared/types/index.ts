export type SortType = 'asc' | 'desc';

export interface IPaginatedResponse<T> {
    results: T[];
    count: number;
}

export const enum EViewType {
    GRID = 'GRID',
    LIST = 'LIST',
}
