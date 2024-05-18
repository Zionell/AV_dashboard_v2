import * as jose from 'jose';

export const copyToClipboard = (text: string) => {
	const inp = document.createElement('input');

	inp.value = text;
	document.body.appendChild(inp);
	inp.select();

	if (!document.execCommand('copy')) {
		console.warn('Error/CopyLink');
	}
	document.body.removeChild(inp);
};

const createSecret = () => {
	const $config = useRuntimeConfig();
	return new TextEncoder().encode($config.public.salt);
};

export const encrypt = async (payload: string): Promise<string> => {
	try {
		const alg = 'HS256';

		return await new jose.SignJWT({ payload: payload })
			.setProtectedHeader({ alg })
			.setExpirationTime('1d')
			.sign(createSecret());
	}
	catch (e) {
		console.warn('encrypt', e);
		return 'error';
	}
};

export const getJWTPayload = async (jwt: string) => {
	try {
		const { payload } = await jose.jwtVerify(jwt, createSecret());
		return payload;
	}
	catch (e) {
		throw new Error(String(e));
	}
};
