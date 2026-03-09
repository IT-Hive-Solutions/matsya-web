
/**
 * Send a notification to a user.
 * Can be called from Server Actions, other API routes, or anywhere server-side.
 *
 * @example
 * await sendNotification({
 *   userId: "abc-123",
 *   title: "Order Confirmed",
 *   body: "Your order #1042 has been confirmed.",
 *   type: "success",
 *   data: { url: "/orders/1042" },
 * });
 */

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    body: string;
    type: "info" | "success" | "warning" | "alert";
    read: boolean;
    data: Record<string, string> | null;
    date_created: string;
}
export interface UpdateNotificationPayload {
  read: boolean;
}

export interface UpdateNotificationResponse {
  success: boolean;
  notification: Notification;
}

export interface UserFcmToken {
    id: string;
    user_id: string;
    token: string;
    device: "web" | "android" | "ios";
    date_created: string;
}

// ─── API Payload Types ────────────────────────────────────────────────────────

export interface SendNotificationPayload {
    userId: string;
    title: string;
    body: string;
    type?: Notification["type"];
    data?: Record<string, string>;
}

export interface SendNotificationResponse {
    success: boolean;
    pushed: boolean;
    successCount?: number;
    failureCount?: number;
    error?: string;
}
export interface GetNotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
}

export async function sendNotification(
    payload: SendNotificationPayload
): Promise<SendNotificationResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/notifications/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to send notification: ${error}`);
    }

    return response.json() as Promise<SendNotificationResponse>;
}

/**
 * Broadcast a notification to multiple users at once.
 */
export async function broadcastNotification(
    userIds: string[],
    payload: Omit<SendNotificationPayload, "userId">
): Promise<PromiseSettledResult<SendNotificationResponse>[]> {
    return Promise.allSettled(
        userIds.map((userId) => sendNotification({ ...payload, userId }))
    );
}