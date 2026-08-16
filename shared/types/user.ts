export enum EUserRole {
    OWNER = 'OWNER',
    MANAGER = 'MANAGER',
    EMPLOYEE = 'EMPLOYEE',
    /**
     * Демо-витрина: видит продукт целиком, как владелец, но не может записать
     * ни байта. Роль не назначается через интерфейс — только вручную в базе.
     */
    TEST = 'TEST',
}

/** Роли, которые можно выдать участнику в интерфейсе. TEST сюда не входит. */
export const ASSIGNABLE_ROLES = [EUserRole.OWNER, EUserRole.MANAGER, EUserRole.EMPLOYEE] as const;

export interface IUserSpec {
    id: string;
    name: string | null;
}

export interface IUserShort extends IUserSpec {
    email: string;
    image: string | null;
    role: EUserRole;
}

export interface IUserMe extends IUserShort {
    companyId: string | null;
    bio: string | null;
    hasPassword: boolean;
    /** Личная норма рабочего дня в часах — задаётся пригласившим. */
    workHours: number;
}

export interface IMember extends IUserShort {
    createdAt: string;
    updatedAt: string;
    timeWeekMs: number;
}
