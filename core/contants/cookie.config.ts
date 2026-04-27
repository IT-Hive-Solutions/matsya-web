export const cookieConfig = {
    sameSite: 'lax' as const,
    path: '/',
    secure: true,
    httpOnly: true,
};


export const ACCESS_TOKEN_COOKIE = "directus_access_token";
export const REFRESH_TOKEN_COOKIE = "directus_refresh_token";
