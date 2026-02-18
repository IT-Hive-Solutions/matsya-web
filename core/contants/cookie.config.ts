export const cookieConfig = {
    sameSite: 'lax' as const,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
};
