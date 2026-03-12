// app/api/notifications/[id]/route.ts
//
// PATCH /api/notifications/:id
//   → Marks a single notification as read/unread in Directus.
//
// Used in:
//   hooks/useNotifications.ts  (markAsRead mutation)

import { NextRequest, NextResponse } from "next/server";
import { updateItem } from "@directus/sdk";
import { getDirectusClient } from "@/core/lib/directus";
import { getAccessToken } from "@/core/lib/auth";
import { Notification, UpdateNotificationPayload, UpdateNotificationResponse } from "@/core/lib/notification";


interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function PATCH(
    request: NextRequest,
    { params }: RouteParams
): Promise<NextResponse<UpdateNotificationResponse | { error: string }>> {
    try {
        const { id } = await params;
        const body = (await request.json()) as UpdateNotificationPayload;

        if (typeof body.read !== "boolean") {
            return NextResponse.json(
                { error: "Missing required field: read (boolean)" },
                { status: 400 }
            );
        }
        const token = await getAccessToken();
        const directus = getDirectusClient(token!);

        const updated = (await directus.request(
            updateItem("notifications", id, { read: body.read })
        )) as Notification;

        return NextResponse.json({ success: true, notification: updated });
    } catch (error) {
        const { id } = await params;

        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`[PATCH /api/notifications/${id}] Error:`, message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}