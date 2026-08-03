export type Period = 'daily' | 'weekly' | 'monthly';
export const enum ETodoStatus {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    REVIEW = 'REVIEW',
    DONE = 'DONE',
}

export interface Range {
    start: Date | string;
    end: Date | string;
}

export interface ITimeLog {
    id: string;
    userId: string;
    userName: string | null;
    start: string;
    end: string;
    active: boolean;
    durationMs: number;
    projectName: string | null;
    todoName: string | null;
    todoStatus: ETodoStatus;
}

export interface IByProject {
    projectId: string | null;
    name: string;
    ms: number;
}

export interface ITotalsTimeStats {
    totalMs: number;
    workingDays: number;
    avgPerDayMs: number;
    /** Относительно суммы личных норм (свои рабочие дни × свои workHours); может быть отрицательным. */
    overtimeMs: number;
}

export interface ITimesStats {
    totals: ITotalsTimeStats;
    byDay: { date: string; ms: number }[];
    byProject: IByProject[];
    logs: ITimeLog[];
}

export interface ITeamSummaryRow {
    userId: string;
    name: string | null;
    image: string | null;
    /** Личная норма рабочего дня — относительно неё считается overtimeMs. */
    workHours: number;
    todayMs: number;
    weekMs: number;
    monthMs: number;
    overtimeMs: number;
}
