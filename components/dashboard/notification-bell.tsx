// components/NotificationBell.jsx
"use client";
import { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { BellIcon } from "lucide-react";

export default function NotificationBell({ userId }: { userId: string }) {
  const { notifications, permission, requestPermission, markAsRead } =
    useNotifications(userId);
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-2">
        <BellIcon  className="w-4 h-4 hover:scale-[1.05] transition-all"/>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-semibold">Notifications</h3>
            {permission !== "granted" && (
              <button
                onClick={requestPermission}
                className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
              >
                Enable Push
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y">
            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-gray-400 text-center">
                No notifications
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    !n.read ? "bg-blue-50" : ""
                  }`}
                >
                  <p className="font-medium text-sm">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{n.body}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.date_created).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
