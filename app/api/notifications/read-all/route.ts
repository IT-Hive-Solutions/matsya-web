// app/api/notifications/read-all/route.ts
//
// PATCH /api/notifications/read-all
//   → Marks ALL unread notifications as read for a given user in Directus.
//
// Called by:
//   hooks/useNotifications.ts  → markAllAsRead() via useMutation

import { NextRequest, NextResponse } from "next/server";
import { readItems, updateItems } from "@directus/sdk";
import { getDirectusClient } from "@/core/lib/directus";
import { getAccessToken } from "@/core/lib/auth";
import { Notification } from "@/core/lib/notification";

interface RequestBody {
    userId: string;
}

export async function PATCH(
    request: NextRequest
): Promise<NextResponse<{ success: boolean; updatedCount: number } | { error: string }>> {
    try {
        const body = (await request.json()) as RequestBody;
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: "Missing required field: userId" }, { status: 400 });
        }
        const token = await getAccessToken();
        const directus = getDirectusClient(token!);

        // ── Find all unread notification IDs for this user ─────────────────────
        const unread = (await directus.request(
            readItems("notifications", {
                filter: {
                    user_id: { _eq: userId },
                    read: { _eq: false },
                },
                fields: ["id"],
                limit: -1,
            })
        )) as Pick<Notification, "id">[];

        if (unread.length === 0) {
            return NextResponse.json({ success: true, updatedCount: 0 });
        }

        const ids = unread.map((n) => n.id);

        // ── Bulk update all to read: true ──────────────────────────────────────
        await directus.request(
            updateItems("notifications", ids, { read: true })
        );

        return NextResponse.json({ success: true, updatedCount: ids.length });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[PATCH /api/notifications/read-all] Error:", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}