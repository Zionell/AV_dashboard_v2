import { z } from 'zod';
import bcryptjs from 'bcryptjs';
import Google from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import type { Adapter } from '@auth/core/adapters';
import { dbClient } from '~/lib/dbClient';
import { NuxtAuthHandler } from '#auth';

const runtimeConfig = useRuntimeConfig();

export default NuxtAuthHandler({
	secret: runtimeConfig.authJs.secret,
	// @ts-expect-error
	adapter: PrismaAdapter(dbClient) as Adapter,
	session: { strategy: 'jwt' },
	pages: {
		signIn: '/auth/login',
		error: '/error',
	},
	providers: [
		// @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
		Google.default({
			clientId: runtimeConfig.googleAuth.clientId,
			clientSecret: runtimeConfig.googleAuth.clientSecret,
		}),
		// @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
		CredentialsProvider.default({
			async authorize(credentials: any) {
				const parsedCredentials = z
					.object({
						type: z.string().optional(),
						name: z.string().optional(),
						companyId: z.string().optional(),
						email: z.string().email(),
						password: z.string().min(6),
					})
					.safeParse(credentials);
				if (parsedCredentials.success) {
					const { type, email, password, name, companyId }
                        = parsedCredentials.data;

					if (type === 'registration') {
						const isExistUser = await dbClient.user.findUnique({
							where: {
								email: email,
							},
						});

						if (isExistUser) {
							throw new Error('Пользователь уже зарегистрирован');
						}

						const salt = bcryptjs.genSaltSync(10);
						const hash = bcryptjs.hashSync(password, salt);

						return await dbClient.user.create({
							data: {
								name: name,
								email: email,
								password: hash,
								companyId,
							},
						});
					}
					const user = await dbClient.user.findUnique({
						where: { email },
					});
					if (!user) {
						throw new Error('Пользователь не найден');
					}

					const checkPassword = await bcryptjs.compare(
						password,
						String(user.password),
					);
					if (!checkPassword) {
						throw new Error('Email или пароль введены неправильно');
					}

					return user;
				}
				return null;
			},
		}),
	],
	callbacks: {
		async session({ session, token }) {
			if (token.sub && session.user) {
				session.user.id = token.sub;
			}

			return session;
		},
		async jwt({ token }) {
			return token;
		},
	},
});
