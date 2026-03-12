// app/api/notifications/send/route.ts
//
// POST /api/notifications/send
//   → Saves a notification record to Directus (in-app).
//   → Sends a Firebase push notification to all the user's FCM tokens.
//   → Cleans up expired/invalid tokens automatically.
//
// Used in:
//   lib/notifications/send.ts    (sendNotification() / broadcastNotification() helpers)
//   Any Server Action or backend route that triggers a notification,
//   e.g. after creating an order, completing a task, or assigning a user.

import { NextRequest, NextResponse } from "next/server";
import { createItem, readItems } from "@directus/sdk";
import type {
    SendNotificationPayload,
    SendNotificationResponse,
    UserFcmToken,
} from "@/core/lib/notification";
import { getDirectusClient } from "@/core/lib/directus";
import { getAccessToken } from "@/core/lib/auth";
import admin from "@/core/lib/firebase/admin";

export async function POST(
    request: NextRequest
): Promise<NextResponse<SendNotificationResponse>> {
    try {
        const body = (await request.json()) as SendNotificationPayload;
        const { userId, title, body: notifBody, type = "info", data = {} } = body;

        if (!userId || !title || !notifBody) {
            return NextResponse.json(
                { success: false, pushed: false, error: "Missing required fields: userId, title, body" },
                { status: 400 }
            );
        }
        const token = await getAccessToken();
        const directus = getDirectusClient(token!);

        // ── 1. Save notification to Directus (in-app record) ──────────────────────
        await directus.request(
            createItem("notifications", {
                user: userId,
                title,
                body: notifBody,
                type,
                data,
                read: false,
            })
        );


        // ── 2. Fetch user's FCM tokens ─────────────────────────────────────────────
        const tokens = (await directus.request(
            readItems("user_fcm_tokens", {
                filter: { user: { _eq: userId } },
                fields: ["token"],
            })
        )) as Pick<UserFcmToken, "token">[];
        console.log({ tokens });

        if (tokens.length === 0) {
            return NextResponse.json({ success: true, pushed: false });
        }

        const tokenValues = tokens.map((t) => t.token);

        // ── 3. Send push via Firebase Admin ───────────────────────────────────────
        const fcmResponse = await admin.messaging().sendEachForMulticast({
            tokens: tokenValues,
            notification: {
                title,
                body: notifBody,
            },
            // Extra data payload (key-value strings only)
            data: {
                type,
                ...data,
            },
            webpush: {
                fcmOptions: {
                    link: data.url ?? "/",
                },
                notification: {
                    title,
                    body: notifBody,
                    icon: "/icon-192x192.png",
                    badge: "/badge-72x72.png",
                },
            },
        });

        // ── 4. Clean up invalid/expired tokens ────────────────────────────────────
        const expiredTokens: string[] = [];
        fcmResponse.responses.forEach((resp, idx) => {
            if (
                !resp.success &&
                (resp.error?.code === "messaging/invalid-registration-token" ||
                    resp.error?.code === "messaging/registration-token-not-registered")
            ) {
                expiredTokens.push(tokenValues[idx]);
            }
        });
        console.log({ ...fcmResponse });

        if (expiredTokens.length > 0) {
            // Fire-and-forget cleanup — don't block the response
            void cleanupExpiredTokens(expiredTokens, directus);
        }

        return NextResponse.json({
            success: true,
            pushed: true,
            successCount: fcmResponse.successCount,
            failureCount: fcmResponse.failureCount,
        });
    } catch (error) {
        console.log("Notification Error: ", error);

        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[send-notification] Error:", message);
        return NextResponse.json(
            { success: false, pushed: false, error: message },
            { status: 500 }
        );
    }
}

// ─── Helper: delete stale FCM tokens from Directus ────────────────────────────
async function cleanupExpiredTokens(
    expiredTokens: string[],
    directus: ReturnType<typeof getDirectusClient>
): Promise<void> {
    try {
        const staleRecords = (await directus.request(
            readItems("user_fcm_tokens", {
                filter: { token: { _in: expiredTokens } },
                fields: ["id"],
            })
        )) as { id: string }[];

        if (staleRecords.length === 0) return;

        const { deleteItems } = await import("@directus/sdk");
        await directus.request(
            deleteItems(
                "user_fcm_tokens",
                staleRecords.map((r) => r.id)
            )
        );
        console.log(`[cleanup] Removed ${staleRecords.length} expired FCM token(s)`);
    } catch (err) {
        console.error("[cleanup] Failed to remove expired tokens:", err);
    }
}