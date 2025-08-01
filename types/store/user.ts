export type UserMeType = {
	id: string;
	name: string | null;
	email: string;
	image: string | null;
	role: string;
	companyId?: string | null | undefined;
};

export type UserShortType = {
	id: string;
	name: string | null;
	role: string;
};

export type UserSpecType = {
	id: string;
	name: string | null;
};

export type UserItemType = {
	isCurrent: boolean;
	user: UserShortType;
};
