// app/api/notifications/register-token/route.ts
//
// POST /api/notifications/register-token
//   → Saves a user's FCM device token to the user_fcm_tokens collection in Directus.
//   → Skips saving if the token already exists (idempotent).
//
// Called by:
//   hooks/useNotifications.ts  → requestPermission() after getting FCM token from Firebase

import { NextRequest, NextResponse } from "next/server";
import { readItems, createItem } from "@directus/sdk";
import type { UserFcmToken } from "@/core/lib/notification";
import { getDirectusClient } from "@/core/lib/directus";
import { getAccessToken } from "@/core/lib/auth";

interface RequestBody {
    userId: string;
    token: string;
    device: UserFcmToken["device"];
}

export async function POST(
    request: NextRequest
): Promise<NextResponse<{ success: boolean; created: boolean } | { error: string }>> {
    try {
        const body = (await request.json()) as RequestBody;
        const { userId, device, token: fcmToken } = body;

        if (!userId || !device) {
            return NextResponse.json(
                { error: "Missing required fields: userId,  device" },
                { status: 400 }
            );
        }
        const token = await getAccessToken();
        const directus = getDirectusClient(token!);

        // ── Check if this token already exists — avoid duplicates ──────────────
        const existing = (await directus.request(
            readItems("user_fcm_tokens", {
                filter: { token: { _eq: fcmToken } },
                fields: ["id"],
                limit: 1,
            })
        )) as Pick<UserFcmToken, "id">[];

        if (existing.length > 0) {
            // Token already registered — nothing to do
            return NextResponse.json({ success: true, created: false });
        }

        // ── Save the new token ─────────────────────────────────────────────────
        await directus.request(
            createItem("user_fcm_tokens", { user: userId, token: fcmToken, device })
        );

        return NextResponse.json({ success: true, created: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[POST /api/notifications/register-token] Error:", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}