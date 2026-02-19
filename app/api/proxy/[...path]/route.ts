import { NextRequest, NextResponse } from "next/server";
import { DIRECTUS_BASE_URL } from "@/core/lib/directus";
import { getAccessToken, getRefreshToken, setAuthCookies, clearAuthCookies } from "@/core/lib/auth";

async function proxyRequest(
    req: NextRequest,
    path: string[],
    accessToken: string
): Promise<Response> {
    console.log(
        { path }
    );

    const directusPath = path.join("/");
    const targetUrl = new URL(`${DIRECTUS_BASE_URL}${directusPath}`);
    console.log({ targetUrl });

    // Forward query params
    req.nextUrl.searchParams.forEach((value, key) => {
        targetUrl.searchParams.set(key, value);
    });

    const headers = new Headers(req.headers);
    headers.set("Authorization", `Bearer ${accessToken}`);
    headers.delete("host");
    headers.delete("cookie"); // Never forward cookies to Directus

    return fetch(targetUrl.toString(), {
        method: req.method,
        headers,
        body: req.method !== "GET" && req.method !== "HEAD" ? req.body : null,
        duplex: "half",
    } as RequestInit);
}

async function tryRefresh(): Promise<{
    accessToken: string;
    refreshToken: string;
} | null> {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) return null;

    const res = await fetch(`${DIRECTUS_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken, mode: "json" }),
    });

    if (!res.ok) return null;

    const { data } = await res.json();
    return { accessToken: data.access_token, refreshToken: data.refresh_token };
}

async function handler(
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    let accessToken = await getAccessToken();

    if (!accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First attempt
    let directusRes = await proxyRequest(req, path, accessToken);

    // If 401, try refresh
    if (directusRes.status === 401) {
        const refreshed = await tryRefresh();

        if (!refreshed) {
            // Refresh failed → force logout (clear cookies)
            const response = NextResponse.json(
                { error: "Session expired. Please log in again." },
                { status: 401 }
            );
            const headers = clearAuthCookies(new Headers(response.headers));
            return new NextResponse(response.body, { status: 401, headers });
        }

        // Retry with new access token
        accessToken = refreshed.accessToken;
        directusRes = await proxyRequest(req, path, accessToken);

        // Build response with refreshed cookies set
        const body = await directusRes.arrayBuffer();
        const response = new NextResponse(body, {
            status: directusRes.status,
            statusText: directusRes.statusText,
        });

        forwardHeaders(directusRes, response.headers)


        const headers = setAuthCookies(
            new NextResponse(),
            refreshed.accessToken,
            refreshed.refreshToken
        );
        headers.forEach((value, key) => {
            response.headers.append(key, value);
        });


        return new NextResponse(body, {
            status: directusRes.status,
            headers: response.headers,
        });
    }

    // Stream the directus response back
    const body = await directusRes.arrayBuffer();

    if (directusRes.status === 204 || body.byteLength === 0) {
        const responseHeaders = new Headers();
        forwardHeaders(directusRes, responseHeaders);

        return new NextResponse(null, {
            status: directusRes.status,
            headers: responseHeaders,
        });
    }
    const response = new NextResponse(body, {
        status: directusRes.status,
        statusText: directusRes.statusText,
    });

    forwardHeaders(directusRes, response.headers)


    return response;
}


function forwardHeaders(from: Response, to: Headers) {
    from.headers.forEach((value, key) => {
        if (
            ![
                "set-cookie",
                "transfer-encoding",
                "content-encoding",
                "content-length",
            ].includes(key.toLowerCase())
        ) {
            to.set(key, value);
        }
    });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;