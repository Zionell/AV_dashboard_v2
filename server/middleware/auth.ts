import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
	const token = getCookie(event, "auth_token");
	if (!token) return;

	const runtimeConfig = useRuntimeConfig();
	const jwtSecret = runtimeConfig.JWT_SALT;

	try {
		event.context.user = jwt.verify(token, jwtSecret!);
	} catch {
		sendError(
			event,
			createError({ statusCode: 401, message: "Invalid token" }),
		);
	}
});
