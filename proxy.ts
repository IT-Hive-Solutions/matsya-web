import { NextRequest, NextResponse } from "next/server";
import { endpoints } from "./core/contants/endpoints";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "./core/contants/cookie.config";

const PROTECTED_ROUTES = ["/"];
const PUBLIC_ROUTES = ["/auth/login", "/api/auth/login"];

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
    const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

    if (!isProtected) return NextResponse.next();

    const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
    const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

    if (accessToken) return NextResponse.next();

    // No access token but has refresh — redirect to a refresh endpoint
    if (!refreshToken) {
        // Let the client handle refresh; redirect to login with returnUrl
        const url = req.nextUrl.clone();
        url.pathname = "/auth/login";
        // url.searchParams.set("returnUrl", pathname);
        return NextResponse.redirect(url);
    }
    try {
        const refreshReq = await fetch(endpoints.auth["refresh-auth"], {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                refresh_token: refreshToken,
                mode: "json"
            }),
        });

        if (!refreshReq.ok) {
            throw new Error("Refresh token expired or invalid");
        }

        const { data } = await refreshReq.json();

        // Create a response that allows the user to continue to their destination
        const response = NextResponse.next();

        // Apply the new cookies to the response so the browser saves them
        response.cookies.set(ACCESS_TOKEN_COOKIE, data.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: data.expires || 900, // Usually 15 mins (900 seconds)
        });

        response.cookies.set(REFRESH_TOKEN_COOKIE, data.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 604800, // Usually 7 days
        });

        return response;

    } catch (error) {
        // 4. The refresh token is dead/revoked -> Force logout
        const url = req.nextUrl.clone();
        url.pathname = "/auth/login";
        const response = NextResponse.redirect(url);

        // Clear the dead cookies
        response.cookies.delete(ACCESS_TOKEN_COOKIE);
        response.cookies.delete(REFRESH_TOKEN_COOKIE);

        return response;
    }
}

export const config = {
    matcher: ["/dashboard/:path*", "/profile/:path*", "/admin/:path*",],
};