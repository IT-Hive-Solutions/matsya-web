importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

let messaging = null;

self.addEventListener("message", (event) => {
  if (event.data?.type !== "FIREBASE_CONFIG") return;
  if (firebase.apps.length > 0) {
    // Already initialized — just reply ready
    event.source?.postMessage({ type: "FIREBASE_READY" });
    return;
  }

  firebase.initializeApp(event.data.config);
  messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title ?? "New Notification";
    const options = {
      body: payload.notification?.body ?? "",
      icon: payload.notification?.icon ?? "/icon-192x192.png",
      badge: "/badge-72x72.png",
      data: payload.data ?? {},
      renotify: true,
      tag: payload.data?.tag ?? "default",
    };
    self.registration.showNotification(title, options);
  });

  // Tell the client Firebase is ready
  event.source?.postMessage({ type: "FIREBASE_READY" });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === url && "focus" in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow(url);
      })
  );
});