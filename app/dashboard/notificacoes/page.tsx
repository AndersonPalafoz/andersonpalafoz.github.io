"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Loader2, MessageSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";

type NotificationItem = {
  id: number;
  type: string;
  title: string;
  message: string;
  metadata: string | null;
  readAt: string | null;
  createdAt: string;
};

function parseMetadata(notification: NotificationItem) {
  try { return notification.metadata ? JSON.parse(notification.metadata) as { courseId?: number; classId?: number } : {}; } catch { return {}; }
}

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | "all" | "clear" | null>(null);

  const load = async () => {
    try {
      const response = await fetch("/api/notifications", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Não foi possível carregar as notificações.");
      setItems(payload.notifications || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao carregar notificações.");
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const markRead = async (id?: number) => {
    setBusyId(id ?? "all");
    try {
      const response = await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(id ? { id } : { all: true }) });
      if (!response.ok) throw new Error("Não foi possível atualizar a notificação.");
      setItems((current) => current.map((item) => id ? item.id === id ? { ...item, readAt: new Date().toISOString() } : item : { ...item, readAt: item.readAt || new Date().toISOString() }));
      toast.success(id ? "Notificação marcada como lida." : "Todas as notificações foram marcadas como lidas.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Erro ao marcar notificação."); }
    finally { setBusyId(null); }
  };

  const clearAll = async () => {
    if (!confirm("Tem certeza de que deseja limpar todas as notificações?")) return;
    setBusyId("clear");
    try {
      const response = await fetch("/api/notifications", { method: "DELETE" });
      if (!response.ok) throw new Error("Erro ao limpar notificações.");
      setItems([]);
      toast.success("Todas as notificações foram limpas com sucesso.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao limpar notificações.");
    } finally {
      setBusyId(null);
    }
  };

  const unread = items.filter((item) => !item.readAt).length;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 border-b border-gray-200 dark:border-slate-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-red-600">Central de comunicação</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-900 dark:text-white">Notificações</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Acompanhe avisos de notas, materiais e atualizações importantes sobre seus estudos.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {unread > 0 && (
            <button
              type="button"
              onClick={() => void markRead()}
              disabled={busyId === "all"}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 transition hover:border-red-300 hover:text-red-600 disabled:opacity-60 shadow-xs"
            >
              <CheckCheck size={15} /> Marcar todas como lidas
            </button>
          )}
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => void clearAll()}
              disabled={busyId === "clear"}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-4 py-2 text-xs font-bold text-red-700 dark:text-red-300 transition hover:bg-red-100 disabled:opacity-60 shadow-xs"
            >
              <Trash2 size={15} /> Limpar todas
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-16 text-red-600">
          <Loader2 className="animate-spin" size={28} />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-sm">
          <Bell className="mx-auto text-gray-300 dark:text-gray-700" size={42} />
          <h2 className="mt-4 font-bold text-gray-900 dark:text-white text-base">Tudo em dia</h2>
          <p className="mt-1 text-xs text-gray-500">Você não possui notificações pendentes no momento.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const data = parseMetadata(item);
            return (
              <article
                key={item.id}
                className={`rounded-2xl border p-5 shadow-xs transition ${
                  item.readAt
                    ? "border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200"
                    : "border-red-200 dark:border-red-900/60 bg-red-50/60 dark:bg-red-950/30 text-gray-900 dark:text-white"
                }`}
              >
                <div className="flex gap-4">
                  <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.readAt ? "bg-gray-100 dark:bg-slate-800 text-gray-500" : "bg-red-600 text-white"}`}>
                    <MessageSquare size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="font-black text-sm">{item.title}</h2>
                        <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-300">{item.message}</p>
                      </div>
                      <time className="shrink-0 text-[11px] font-semibold text-gray-400">
                        {new Date(item.createdAt).toLocaleString("pt-BR")}
                      </time>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      {data.courseId && (
                        <Link href={`/cursos/${data.courseId}`} className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline">
                          Ver curso
                        </Link>
                      )}
                      {data.classId && (
                        <Link href="/dashboard/meus-cursos" className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline">
                          Ver turma externa
                        </Link>
                      )}
                      {!item.readAt && (
                        <button
                          type="button"
                          onClick={() => void markRead(item.id)}
                          disabled={busyId === item.id}
                          className="text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-60"
                        >
                          Marcar como lida
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
