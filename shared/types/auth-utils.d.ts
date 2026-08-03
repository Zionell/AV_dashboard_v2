declare module '#auth-utils' {
    interface User {
        id: string;
        email: string;
        role: string;
    }
}

declare module 'h3' {
    interface H3EventContext {
        user?: {
            id: string;
            email: string;
            role: string;
            companyId: string | null;
        };
    }
}

export {};
