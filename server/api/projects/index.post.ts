import {dbClient} from '~/lib/dbClient';
import {z} from "zod";

const ProjectSchema = z.object({
	name: z.string(),
	designUrl: z.string().optional(),
	gitHub: z.string().optional(),
	projectUrl: z.string().optional(),
	companyId: z.string(),
})

export default defineEventHandler(async (event) => {
	try {
		const body = await readBody(event);

		const parsedBody = ProjectSchema.safeParse(body)
		if (!parsedBody.success) {
			throw createError({
				statusCode: 400,
				statusMessage: 'Error data',
			})
		}
		const usersArr = body.users.length ? body.users : []
		const {name} = parsedBody.data;
		const image = body?.image?.content ?? '';
		let imgUrl = '';

		if (image) {
			const {ext} = parseDataUrl(image);
			imgUrl = `/images/projects/${name}.${ext}`

			await storeFileLocally(image, name, '/projects');
		}

		await dbClient.project.create({
			data: {
				...parsedBody.data,
				imgUrl,
				users: {
					create: [
						...usersArr.map((userId: string) => ({
							user: {
								connect: {
									id: userId,
								},
							},
						})),
					],
				},
			},
		});

		setResponseStatus(event, 201);
	} catch (e) {
		console.warn('Projects/ post: ', e);
		return e;
	}
});
