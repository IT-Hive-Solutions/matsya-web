// app/api/notifications/route.ts
//
// GET /api/notifications
//   → Fetches all notifications for the currently authenticated user from Directus.
//   → Called by useNotifications() hook via useQuery.
//
// Used in:
//   hooks/useNotifications.ts  (useQuery fetcher)

import { getAccessToken } from "@/core/lib/auth";
import { getDirectusClient } from "@/core/lib/directus";
import { GetNotificationsResponse, Notification } from "@/core/lib/notification";
import { readItems } from "@directus/sdk";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest
): Promise<NextResponse<GetNotificationsResponse | { error: string }>> {
    try {
        // ── Read userId from search params ────────────────────────────────────────
        // The client passes ?userId=xxx since Directus auth is handled separately.
        // If you have session-based auth (e.g. NextAuth), replace this with:
        //   const session = await getServerSession(authOptions);
        //   const userId = session?.user?.id;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }
        const token = await getAccessToken();
        const directus = getDirectusClient(token!);
        // ── Fetch notifications from Directus ─────────────────────────────────────
        const notifications = (await directus.request(
            readItems("notifications", {
                filter: { user_id: { _eq: userId } },
                sort: ["-date_created"],
                limit: 30,
            })
        )) as Notification[];

        const unreadCount = notifications.filter((n) => !n.read).length;

        return NextResponse.json({
            notifications,
            unreadCount,
            total: notifications.length,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[GET /api/notifications] Error:", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}