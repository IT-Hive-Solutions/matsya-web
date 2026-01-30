import { getUserData } from '@/core/lib/dal';
import { NextResponse, type NextRequest } from 'next/server'
// import { session } from './constants/token';

export async function proxy(request: NextRequest) {
    console.log("🔥 PROXY CALLED - Path:", request.nextUrl.pathname);

    let token: string | undefined;
    const pathName: string = request.nextUrl.pathname;

    if (request.cookies.has("directus_session_token")) {
        token = request.cookies.get("directus_session_token")?.value;
    } else if (request.headers.get("Authorization")?.startsWith("Bearer ")) {
        token = request.headers.get("Authorization")?.substring(7);
    }

    if (token) {
        const user = await getUserData();

        // Redirect to password reset if needed (except if already on reset page)
        if (user.needs_password_change &&
            pathName !== "/auth/reset-password" &&
            !pathName.startsWith("/auth/reset-password")) {
            return NextResponse.redirect(new URL('/auth/reset-password?password_change=true', request.url));
        }

        // Redirect authenticated users away from login page
        if (pathName === "/auth/login") {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }
    // If user is NOT authenticated
    else {
        // Allow access to auth pages
        if (pathName.startsWith('/auth/')) {
            return NextResponse.next();
        }

        // Redirect to login for protected routes
        if (pathName === '/' || !pathName.startsWith('/auth/')) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }



    return NextResponse.next();

}

export const config = {
    matcher: [
        '/',
        '/auth/login',
        '/auth/:path*',
    ]

}