import NextAuth from 'next-auth';

export type UserEntity = {
	id: string;
	email: string;
	image: string;
	name: string;
};

export type SessionEntity = {
	user: {
		id: string;
		email: string;
		image: string;
		name: string;
	};
	expires: string;
};

declare module 'next-auth' {
	interface Session {
		user: SessionEntity['user'];
	}
	interface User extends UserEntity {}
}
