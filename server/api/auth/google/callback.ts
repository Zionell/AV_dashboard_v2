import type { ITokenResponse, IUserGoogle } from "#shared/types/auth";
import jwt from "jsonwebtoken";
import { dbClient } from "~~/lib/dbClient";

export default defineEventHandler(async (event) => {
	const runtimeConfig = useRuntimeConfig();
	const clientId = runtimeConfig.GOOGLE_CLIENT_ID;
	const redirectUri = runtimeConfig.GOOGLE_REDIRECT_URI;
	const clientSecret = runtimeConfig.GOOGLE_CLIENT_SECRET;
	const jwtSecret = runtimeConfig.JWT_SALT;

	const { code } = getQuery(event) as { code?: string };
	if (!code) {
		throw new Error("No code returned from Google");
	}

	// Обменять code на токены
	const tokenResponse = await $fetch<ITokenResponse>(
		"https://oauth2.googleapis.com/token",
		{
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({
				code,
				client_id: clientId,
				client_secret: clientSecret,
				redirect_uri: redirectUri,
				grant_type: "authorization_code",
			}),
		},
	);

	const { access_token } = tokenResponse;

	// Получить профиль пользователя
	const userInfoResponse = await $fetch<IUserGoogle>(
		"https://www.googleapis.com/oauth2/v3/userinfo",
		{
			headers: {
				Authorization: `Bearer ${access_token}`,
			},
		},
	);

	let user = await dbClient.user.findUnique({
		where: {
			email: userInfoResponse.email,
		},
	});

	if (!user) {
		user = await dbClient.user.create({
			data: {
				email: userInfoResponse.email,
				name: userInfoResponse.name,
				image: userInfoResponse.picture,
			},
		});
	}

	const token = jwt.sign(
		{
			id: user.id,
			email: user.email,
			role: user.role,
		},
		jwtSecret,
		{
			expiresIn: "7d",
		},
	);

	setCookie(event, "auth_token", token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		path: "/",
		maxAge: 60 * 60 * 24 * 7,
	});

	return sendRedirect(event, "/");
});
