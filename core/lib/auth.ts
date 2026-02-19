import { cookies } from "next/headers";
import { cookieConfig } from "../contants/cookie.config";

const ACCESS_TOKEN_COOKIE = "directus_access_token";
const REFRESH_TOKEN_COOKIE = "directus_refresh_token";


export const ACCESS_MAX_AGE = 60 * 15;         // 15 minutes
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// --- Server-side cookie readers (Next.js server components / route handlers)
export async function getAccessToken(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
}

// --- Writers (used inside Route Handlers via NextResponse)
export function setAuthCookies(
    response: Response,
    accessToken: string,
    refreshToken: string
) {
    const headers = new Headers(response.headers);

    const accessCookie = serializeCookie(ACCESS_TOKEN_COOKIE, accessToken, {
        ...cookieConfig,
        maxAge: ACCESS_MAX_AGE,
    });

    const refreshCookie = serializeCookie(REFRESH_TOKEN_COOKIE, refreshToken, {
        ...cookieConfig,
        maxAge: REFRESH_MAX_AGE,
    });

    headers.append("Set-Cookie", accessCookie);
    headers.append("Set-Cookie", refreshCookie);

    return headers;
}

export function clearAuthCookies(headers: Headers) {
    headers.append(
        "Set-Cookie",
        serializeCookie(ACCESS_TOKEN_COOKIE, "", { ...cookieConfig, maxAge: 0 })
    );
    headers.append(
        "Set-Cookie",
        serializeCookie(REFRESH_TOKEN_COOKIE, "", { ...cookieConfig, maxAge: 0 })
    );
    return headers;
}

function serializeCookie(
    name: string,
    value: string,
    opts: {
        httpOnly: boolean;
        secure: boolean;
        sameSite: "lax" | "strict" | "none";
        path: string;
        maxAge: number;
    }
): string {
    let str = `${name}=${encodeURIComponent(value)}`;
    str += `; Path=${opts.path}`;
    str += `; Max-Age=${opts.maxAge}`;
    str += `; SameSite=${opts.sameSite}`;
    if (opts.httpOnly) str += "; HttpOnly";
    if (opts.secure) str += "; Secure";
    return str;
}