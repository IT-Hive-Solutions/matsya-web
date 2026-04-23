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

import { getDirectusClient, getDirectusWithStaticToken } from "@/core/lib/directus";
import { adminMessaging } from "@/core/lib/firebase/admin";
import type {
    SendNotificationPayload,
    SendNotificationResponse,
    UserFcmToken,
} from "@/core/lib/notification";
import { sendNotificationDirect } from "@/core/lib/notification-sender";
import { createItem, readItems } from "@directus/sdk";
import { NextRequest, NextResponse } from "next/server";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(
    request: NextRequest
): Promise<NextResponse<SendNotificationResponse>> {
    try {
        const result = await sendNotificationDirect(await request.json());
        return NextResponse.json(result);
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

