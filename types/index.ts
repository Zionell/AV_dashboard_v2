export type SortType = 'asc' | 'desc';

export type SpecType = {
	label: string | number;
	value: string | number;
};

export type TableSortType = {
	column: string;
	direction: SortType;
};

export type TimeType = {
	date: string;
	_sum: {
		times: number | null;
	};
};
