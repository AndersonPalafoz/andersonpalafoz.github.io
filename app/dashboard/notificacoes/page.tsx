"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Loader2, MessageSquare } from "lucide-react";
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

function metadata(notification: NotificationItem) {
  try { return notification.metadata ? JSON.parse(notification.metadata) as { courseId?: number } : {}; } catch { return {}; }
}

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | "all" | null>(null);

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
    } catch (error) { toast.error(error instanceof Error ? error.message : "Erro ao marcar notificação."); }
    finally { setBusyId(null); }
  };

  const unread = items.filter((item) => !item.readAt).length;

  return <div className="space-y-8 pb-12">
    <div className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-xs font-black uppercase tracking-[0.22em] text-red-600">Central de comunicação</p><h1 className="mt-2 text-3xl font-black tracking-tight text-gray-900">Notificações</h1><p className="mt-2 text-sm text-gray-600">Acompanhe respostas e atualizações importantes sobre seus estudos.</p></div>
      {unread > 0 && <button type="button" onClick={() => void markRead()} disabled={busyId === "all"} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition hover:border-red-300 hover:text-red-600 disabled:opacity-60"><CheckCheck size={16} /> Marcar todas como lidas</button>}
    </div>
    {loading ? <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white py-16 text-red-600"><Loader2 className="animate-spin" size={28} /></div> : items.length === 0 ? <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center"><Bell className="mx-auto text-gray-300" size={42} /><h2 className="mt-4 font-bold text-gray-900">Tudo em dia</h2><p className="mt-1 text-sm text-gray-500">Você ainda não recebeu notificações.</p></div> : <div className="space-y-3">{items.map((item) => { const data = metadata(item); return <article key={item.id} className={`rounded-2xl border p-5 shadow-sm transition ${item.readAt ? "border-gray-200 bg-white" : "border-red-200 bg-red-50/50"}`}><div className="flex gap-4"><div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.readAt ? "bg-gray-100 text-gray-500" : "bg-red-600 text-white"}`}><MessageSquare size={18} /></div><div className="min-w-0 flex-1"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="font-black text-gray-900">{item.title}</h2><p className="mt-1 text-sm leading-6 text-gray-700">{item.message}</p></div><time className="shrink-0 text-xs font-semibold text-gray-500">{new Date(item.createdAt).toLocaleString("pt-BR")}</time></div><div className="mt-4 flex flex-wrap items-center gap-3">{data.courseId && <Link href={`/cursos/${data.courseId}`} className="text-sm font-bold text-red-600 hover:underline">Ver curso</Link>}{!item.readAt && <button type="button" onClick={() => void markRead(item.id)} disabled={busyId === item.id} className="text-xs font-bold text-gray-600 hover:text-red-600 disabled:opacity-60">Marcar como lida</button>}</div></div></div></article>; })}</div>}
  </div>;
}
