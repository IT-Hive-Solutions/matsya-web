import { NextRequest, NextResponse } from "next/server";
import { getRefreshToken, clearAuthCookies } from "@/core/lib/auth";
import { directusEndpoints } from "@/core/contants/directusEndpoints";

export async function POST(_req: NextRequest) {
  try {
    const refreshToken = await getRefreshToken();

    if (refreshToken) {
      // Best-effort logout from Directus (invalidates refresh token server-side)
      await fetch(directusEndpoints.auth.logout, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      }).catch(() => {
        // Swallow error — we still clear cookies locally
      });
    }

    const response = NextResponse.json({ success: true }, { status: 200 });
    const headers = clearAuthCookies(new Headers(response.headers));

    return new NextResponse(response.body, { status: 200, headers });
  } catch (error) {
    console.error("[Logout Error]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}