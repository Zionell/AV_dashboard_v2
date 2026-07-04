export default defineEventHandler(async (event) => {
    const runtimeConfig = useRuntimeConfig();
    const clientId = runtimeConfig.GOOGLE_CLIENT_ID;
    const redirectUri = runtimeConfig.GOOGLE_REDIRECT_URI;
    const oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';

    const params = {
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        prompt: 'consent',
    };
    const searchParams = new URLSearchParams(params);

    await sendRedirect(event, `${oauth2Endpoint}?${searchParams}`, 302);
});
