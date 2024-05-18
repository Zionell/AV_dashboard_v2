import { dbClient } from '~/lib/dbClient';

type ImageType = {
	content: string;
};

type BodyType = {
	name: string;
	companyId: string;
	designUrl: string | null;
	gitHub: string | null;
	users: string[];
	image: ImageType ;
};

export default defineEventHandler(async (event) => {
	try {
		const body = await readBody(event);
		const { name, designUrl, gitHub, companyId, users, image }: BodyType = body;
		const { ext } = parseDataUrl(image.content);

		await dbClient.project.create({
			data: {
				name,
				designUrl,
				gitHub,
				companyId,
				imgUrl: `/images/projects/${name}.${ext}`,
				users: {
					create: [
						...users.map((userId: string) => ({
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

		if (image?.content) {
			await storeFileLocally(image.content, name, '/projects');
		}

		setResponseStatus(event, 201);
	}
	catch (e) {
		console.warn('Projects/ post: ', e);
		return e;
	}
});
