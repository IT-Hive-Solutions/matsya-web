import { createItem, readItems, deleteItems } from "@directus/sdk";
import { getDirectusWithStaticToken } from "@/core/lib/directus";
import { adminMessaging } from "@/core/lib/firebase/admin";
import type { SendNotificationPayload, SendNotificationResponse, UserFcmToken } from "@/core/lib/notification";

export async function sendNotificationDirect(
    payload: SendNotificationPayload
): Promise<SendNotificationResponse> {
    const { userId, title, body: notifBody, type = "info", data = {} } = payload;

    if (!userId || !title || !notifBody) {
        return { success: false, pushed: false, error: "Missing required fields" };
    }

    const directus = getDirectusWithStaticToken();

    // 1. Save in-app notification to Directus
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

    // 2. Fetch FCM tokens for this user
    const tokens = (await directus.request(
        readItems("user_fcm_tokens", {
            filter: { user: { _eq: userId } },
            fields: ["token"],
        })
    )) as Pick<UserFcmToken, "token">[];

    if (tokens.length === 0) {
        return { success: true, pushed: false };
    }

    const tokenValues = tokens.map((t) => t.token);
    console.log({ tokenValues });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // 3. Send via Firebase Admin
    const fcmResponse = await adminMessaging.sendEachForMulticast({
        tokens: tokenValues,
        notification: { title, body: notifBody },
        data: { type, ...data },
        webpush: {
            fcmOptions: {
                link: data.url ? `${appUrl}${data.url}` : appUrl,
            },
            notification: {
                title,
                body: notifBody,
                icon: "/icon-192x192.png",
                badge: "/badge-72x72.png",
            },
        },
    });
    console.log({ fcmResponse });


    // 4. Clean up expired tokens
    const expiredTokens = tokenValues.filter((_, idx) => {
        const r = fcmResponse.responses[idx];
        return (
            !r.success &&
            (r.error?.code === "messaging/invalid-registration-token" ||
                r.error?.code === "messaging/registration-token-not-registered")
        );
    });

    if (expiredTokens.length > 0) {
        void cleanupExpiredTokens(expiredTokens, directus);
    }

    return {
        success: true,
        pushed: true,
        successCount: fcmResponse.successCount,
        failureCount: fcmResponse.failureCount,
    };
}

async function cleanupExpiredTokens(
    expiredTokens: string[],
    directus: ReturnType<typeof getDirectusWithStaticToken>
): Promise<void> {
    try {
        const stale = await directus.request(
            readItems("user_fcm_tokens", {
                filter: { token: { _in: expiredTokens } },
                fields: ["id"],
            })
        ) as { id: string }[];

        if (stale.length === 0) return;

        await directus.request(
            deleteItems("user_fcm_tokens", stale.map((r) => r.id))
        );
    } catch (err) {
        console.error("[cleanup] Failed to remove expired tokens:", err);
    }
}