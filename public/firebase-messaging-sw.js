// public/firebase-messaging-sw.js
// NOTE: This must be plain JS (not TypeScript) — service workers run in the browser directly.
// Place this file at: /public/firebase-messaging-sw.js

importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

// Config is injected at registration time via ServiceWorkerRegistration.postMessage
// or you can hardcode the public values here since they are not secret.
firebase.initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});
console.log("FIREBASE", {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

const messaging = firebase.messaging();

/**
 * Handle push notifications received while the app is in the BACKGROUND or CLOSED.
 * When the app is in the foreground, onMessage() in the client handles it instead.
 */
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Background message received:", payload);

  const title = payload.notification?.title ?? "New Notification";
  const options = {
    body: payload.notification?.body ?? "",
    icon: payload.notification?.icon ?? "/icon-192x192.png",
    badge: "/badge-72x72.png",
    data: payload.data ?? {},
    // Show notification even if app is open in another tab
    renotify: true,
    tag: payload.data?.tag ?? "default",
  };

  self.registration.showNotification(title, options);
});

/**
 * Open/focus the app when the user clicks a notification.
 */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url ?? "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});