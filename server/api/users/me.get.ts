import { dbClient } from "~~/lib/dbClient";

export default defineEventHandler(async (event) => {
	const user = event.context.user;

	if (!user) throw createError({ statusCode: 401, message: "Unauthorized" });

	return dbClient.user.findUnique({
		where: { email: user.email },
	});
});
