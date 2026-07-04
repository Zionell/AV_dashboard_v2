export enum EUserRole {
    OWNER = 'OWNER',
    MANAGER = 'MANAGER',
    EMPLOYEE = 'EMPLOYEE',
}

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
}
