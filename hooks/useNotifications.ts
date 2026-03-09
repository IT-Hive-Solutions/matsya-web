"use client";

// ─── NO Directus SDK imports here ────────────────────────────────────────────
// This is a client-side hook. All Directus SDK calls live in the API routes:
//   GET    /api/notifications              → fetch list
//   PATCH  /api/notifications/:id         → mark one as read
//   PATCH  /api/notifications/read-all    → mark all as read
//   POST   /api/notifications/register-token → save FCM token
// This hook only communicates with those routes via fetch().

import { useEffect, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getToken, onMessage, MessagePayload } from "firebase/messaging";
import { getFirebaseMessaging } from "@/core/lib/firebase/client";
import type {
    Notification,
    GetNotificationsResponse,
} from "@/core/lib/notification";

// ─── Query key factory ────────────────────────────────────────────────────────
export const notificationKeys = {
    all: (userId: string) => ["notifications", userId] as const,
};

// ─── API fetch helpers (pure fetch — no Directus SDK) ────────────────────────

async function fetchNotifications(userId: string): Promise<GetNotificationsResponse> {
    const res = await fetch(`/api/notifications?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error ?? "Failed to fetch notifications");
    }
    return res.json() as Promise<GetNotificationsResponse>;
}

async function markOneAsRead(id: string): Promise<void> {
    const res = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
    });
    if (!res.ok) throw new Error(await res.text());
}

async function markAllAsReadRequest(userId: string): Promise<void> {
    const res = await fetch(`/api/notifications/read-all`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error(await res.text());
}

async function registerFcmToken(userId: string, token: string): Promise<void> {
    const res = await fetch(`/api/notifications/register-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, token, device: "web" }),
    });
    if (!res.ok) throw new Error(await res.text());
}

// ─── Types ────────────────────────────────────────────────────────────────────

type PermissionState = "default" | "granted" | "denied";

interface UseNotificationsReturn {
    permission: PermissionState;
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
    requestPermission: () => Promise<void>;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearNotification: (id: string) => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useNotifications(userId: string | null): UseNotificationsReturn {
    const [permission, setPermission] = useState<PermissionState>("default");
    const queryClient = useQueryClient();

    // ─── useQuery: GET /api/notifications ─────────────────────────────────────
    const { data, isLoading, isError, refetch } = useQuery<GetNotificationsResponse>({
        queryKey: notificationKeys.all(userId ?? ""),
        queryFn: () => fetchNotifications(userId!),
        enabled: !!userId,
        refetchInterval: 60_000,
        refetchOnWindowFocus: true,
        placeholderData: (prev) => prev,
    });

    const notifications: Notification[] = data?.notifications ?? [];

    // ─── useMutation: PATCH /api/notifications/:id ────────────────────────────
    const markAsReadMutation = useMutation({
        mutationFn: (id: string) => markOneAsRead(id),

        // Optimistic update: flip read=true in cache immediately
        onMutate: async (id: string) => {
            if (!userId) return;
            await queryClient.cancelQueries({ queryKey: notificationKeys.all(userId) });

            const previous = queryClient.getQueryData<GetNotificationsResponse>(
                notificationKeys.all(userId)
            );

            queryClient.setQueryData<GetNotificationsResponse>(
                notificationKeys.all(userId),
                (prev) => {
                    if (!prev) return prev;
                    const wasUnread = prev.notifications.find((n) => n.id === id && !n.read);
                    return {
                        ...prev,
                        notifications: prev.notifications.map((n) =>
                            n.id === id ? { ...n, read: true } : n
                        ),
                        unreadCount: wasUnread ? prev.unreadCount - 1 : prev.unreadCount,
                    };
                }
            );

            return { previous };
        },

        // Rollback on error
        onError: (_err, _id, context) => {
            if (context?.previous && userId) {
                queryClient.setQueryData(notificationKeys.all(userId), context.previous);
            }
        },
    });

    // ─── useMutation: PATCH /api/notifications/read-all ───────────────────────
    const markAllAsReadMutation = useMutation({
        mutationFn: () => markAllAsReadRequest(userId!),

        // Optimistic update: set all read=true in cache immediately
        onMutate: async () => {
            if (!userId) return;
            await queryClient.cancelQueries({ queryKey: notificationKeys.all(userId) });

            const previous = queryClient.getQueryData<GetNotificationsResponse>(
                notificationKeys.all(userId)
            );

            queryClient.setQueryData<GetNotificationsResponse>(
                notificationKeys.all(userId),
                (prev) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        notifications: prev.notifications.map((n) => ({ ...n, read: true })),
                        unreadCount: 0,
                    };
                }
            );

            return { previous };
        },

        // Rollback on error
        onError: (_err, _vars, context) => {
            if (context?.previous && userId) {
                queryClient.setQueryData(notificationKeys.all(userId), context.previous);
            }
        },
    });

    // ─── Listen for foreground Firebase push messages ─────────────────────────
    // When a push arrives while the app is open, inject it into the query cache
    // directly — no extra network request needed.
    useEffect(() => {
        if (!userId) return;
        let unsubscribe: (() => void) | undefined;

        const setupForegroundListener = async (): Promise<void> => {
            const messaging = await getFirebaseMessaging();
            if (!messaging) return;

            unsubscribe = onMessage(messaging, (payload: MessagePayload) => {
                const incoming: Notification = {
                    id: `local-${Date.now()}`,
                    user_id: userId,
                    title: payload.notification?.title ?? "",
                    body: payload.notification?.body ?? "",
                    type: (payload.data?.type as Notification["type"]) ?? "info",
                    read: false,
                    data: (payload.data as Record<string, string>) ?? null,
                    date_created: new Date().toISOString(),
                };

                queryClient.setQueryData<GetNotificationsResponse>(
                    notificationKeys.all(userId),
                    (prev) => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            notifications: [incoming, ...prev.notifications],
                            unreadCount: prev.unreadCount + 1,
                            total: prev.total + 1,
                        };
                    }
                );
            });
        };

        setupForegroundListener();
        return () => unsubscribe?.();
    }, [userId, queryClient]);

    // ─── Request push permission + register SW + POST token to API ────────────
    // Token is saved via POST /api/notifications/register-token
    // which uses Directus SDK on the server side — not here.
    const requestPermission = useCallback(async (): Promise<void> => {
        try {
            const result = await Notification.requestPermission();
            setPermission(result as PermissionState);
            if (result !== "granted" || !userId) return;

            const registration = await navigator.serviceWorker.register(
                "/firebase-messaging-sw.js"
            );

            registration.active?.postMessage({
                type: "FIREBASE_CONFIG",
                config: {
                    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
                    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
                    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
                    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
                    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
                },
            });

            const messaging = await getFirebaseMessaging();
            if (!messaging) return;

            const token = await getToken(messaging, {
                vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
                serviceWorkerRegistration: registration,
            });

            if (!token) {
                console.warn("FCM token not received.");
                return;
            }

            // POST to our API route — Directus SDK runs there, not here
            await registerFcmToken(userId, token);
            console.log("FCM token registered.");
        } catch (err) {
            console.error("Permission/token error:", err);
        }
    }, [userId]);

    // ─── Remove from cache only (UI dismiss — no server delete) ───────────────
    const clearNotification = useCallback(
        (id: string): void => {
            if (!userId) return;
            queryClient.setQueryData<GetNotificationsResponse>(
                notificationKeys.all(userId),
                (prev) => {
                    if (!prev) return prev;
                    const removed = prev.notifications.find((n) => n.id === id);
                    return {
                        ...prev,
                        notifications: prev.notifications.filter((n) => n.id !== id),
                        unreadCount:
                            removed && !removed.read ? prev.unreadCount - 1 : prev.unreadCount,
                        total: prev.total - 1,
                    };
                }
            );
        },
        [userId, queryClient]
    );

    return {
        permission,
        notifications,
        unreadCount: data?.unreadCount ?? 0,
        isLoading,
        isError,
        refetch,
        requestPermission,
        markAsRead: (id: string) => markAsReadMutation.mutate(id),
        markAllAsRead: () => markAllAsReadMutation.mutate(),
        clearNotification,
    };
}