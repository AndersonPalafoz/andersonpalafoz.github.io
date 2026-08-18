"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/notifications", { cache: "no-store" });
        const data = await res.json();
        if (res.ok && typeof data.unreadCount === "number") {
          setUnreadCount(data.unreadCount);
        }
      } catch {
        // Ignora silenciosamente
      }
    };
    void fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // Atualiza a cada 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <Link
      href="/dashboard/notificacoes"
      aria-label={`Notificações${unreadCount > 0 ? `, ${unreadCount} não lidas` : ""}`}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 transition hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600"
    >
      <Bell size={17} />
      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 border-2 border-white dark:border-slate-900"></span>
        </span>
      )}
    </Link>
  );
}
