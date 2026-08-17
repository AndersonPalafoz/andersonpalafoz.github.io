"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCheck, Clock, MessageSquare, Trophy, AlertCircle, X, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: "deadline" | "message" | "achievement" | "info";
  createdAt: string;
  isRead?: boolean;
  readAt?: string | null;
}

export function RealtimeNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      const list = data.notifications || data.items || [];
      setNotifications(list);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Polling a cada 10s para dados em tempo real
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead && !n.readAt).length;

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
      toast.success("Todas as notificações foram marcadas como lidas.");
    } catch (err) {
      toast.error("Erro ao atualizar notificações.");
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      );
    } catch (err) {
      console.error("Error marking notification read:", err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-300 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 dark:hover:bg-slate-800"
        aria-label="Notificações em tempo real"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-red-600" />
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Notificações & Medalhas</h4>
              {unreadCount > 0 && (
                <span className="text-[10px] font-black bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400 px-2 py-0.5 rounded-full">
                  {unreadCount} novas
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                  title="Marcar todas como lidas"
                >
                  <CheckCheck size={14} /> Ler tudo
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                Nenhuma notificação no momento. Suas medalhas e avisos aparecerão aqui.
              </div>
            ) : (
              notifications.map((item) => {
                const isUnread = !item.isRead && !item.readAt;
                let icon = <AlertCircle size={16} className="text-blue-500" />;
                if (item.type === "deadline") icon = <Clock size={16} className="text-amber-500" />;
                if (item.type === "message") icon = <MessageSquare size={16} className="text-emerald-500" />;
                if (item.type === "achievement") icon = <Trophy size={16} className="text-red-600" />;

                return (
                  <div
                    key={item.id}
                    onClick={() => isUnread && markAsRead(item.id)}
                    className={`p-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-start gap-3 relative cursor-pointer ${
                      isUnread ? "bg-red-50/30 dark:bg-red-950/20 font-medium" : ""
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h5 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">{item.title}</h5>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(item.createdAt).toLocaleDateString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{item.message}</p>
                    </div>
                    {isUnread && <span className="h-2 w-2 rounded-full bg-red-600 shrink-0 mt-1.5" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
