/**
 * Тариф компании. Строкой (в отличие от числовых приоритетов): порядка между планами
 * нет, сортировать по ним не нужно, а читаемость значения в БД важнее.
 */
export enum ECompanyPlan {
    FREE = 'FREE',
    PRO = 'PRO',
    TEAM = 'TEAM',
}

export interface ICompanyPlanLimits {
    label: string;
    /** Максимум участников компании, включая владельца. */
    seats: number;
    /** Максимум проектов в компании. */
    projects: number;
    /** Квота хранилища в байтах (считаем вложения задач). */
    storageBytes: number;
}

const GB = 1024 ** 3;

/** Единственный источник правды по лимитам — и сервер, и UI берут отсюда. */
export const COMPANY_PLANS: Record<ECompanyPlan, ICompanyPlanLimits> = {
    [ECompanyPlan.FREE]: { label: 'Free', seats: 1, projects: 3, storageBytes: GB },
    [ECompanyPlan.PRO]: { label: 'Pro', seats: 5, projects: 5, storageBytes: 3 * GB },
    [ECompanyPlan.TEAM]: { label: 'Team', seats: 20, projects: 10, storageBytes: 10 * GB },
};

export interface ICompanyPlanState {
    plan: ECompanyPlan;
    limits: ICompanyPlanLimits;
    usage: {
        seats: number;
        projects: number;
        storageBytes: number;
    };
}

export interface ICompanyProjectStat {
    id: string;
    name: string;
    totalTodos: number;
    completedTodos: number;
    members: number;
    isClosed: boolean;
}

export interface ICompanyStats {
    members: {
        total: number;
        newThisMonth: number;
        byRole: Record<string, number>;
    };
    projects: {
        active: number;
        closed: number;
        items: ICompanyProjectStat[];
    };
    tasks: {
        inProgress: number;
    };
    time: {
        todayMs: number;
        yesterdayMs: number;
        weekMs: number;
        lastWeekMs: number;
        monthMs: number;
        lastMonthMs: number;
        avgPerMemberWeekMs: number;
    };
}
