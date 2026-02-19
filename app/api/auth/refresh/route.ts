import { NextRequest, NextResponse } from "next/server";
import { getRefreshToken, setAuthCookies, clearAuthCookies } from "@/core/lib/auth";
import { directusEndpoints } from "@/core/contants/directusEndpoints";

export async function POST(_req: NextRequest) {
    try {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
            return NextResponse.json({ error: "No refresh token" }, { status: 401 });
        }

        const directusRes = await fetch(directusEndpoints.auth.refresh, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken, mode: "json" }),
        });

        if (!directusRes.ok) {
            // Refresh token is invalid — force logout
            const response = NextResponse.json(
                { error: "Session expired. Please log in again." },
                { status: 401 }
            );
            const headers = clearAuthCookies(new Headers(response.headers));
            return new NextResponse(response.body, { status: 401, headers });
        }

        const { data } = await directusRes.json();
        const { access_token, refresh_token } = data;

        const response = NextResponse.json({ success: true }, { status: 200 });
        const headers = setAuthCookies(response, access_token, refresh_token);

        return new NextResponse(response.body, { status: 200, headers });
    } catch (error) {
        console.error("[Refresh Error]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}