import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/"];
const PUBLIC_ROUTES = ["/auth/login", "/api/auth/login"];

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
    const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

    if (!isProtected) return NextResponse.next();

    const accessToken = req.cookies.get("directus_access_token")?.value;
    const refreshToken = req.cookies.get("directus_refresh_token")?.value;

    if (accessToken) return NextResponse.next();

    // No access token but has refresh — redirect to a refresh endpoint
    if (refreshToken) {
        // Let the client handle refresh; redirect to login with returnUrl
        const url = req.nextUrl.clone();
        url.pathname = "/auth/login";
        // url.searchParams.set("returnUrl", pathname);
        return NextResponse.redirect(url);
    }

    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
}

export const config = {
    matcher: ["/dashboard/:path*", "/profile/:path*", "/admin/:path*",],
};