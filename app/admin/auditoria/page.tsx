'use client';

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";

type AccessEvent = {
  id: number;
  userId: number | null;
  userEmail: string | null;
  eventType: string;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
};

const eventLabels: Record<string, string> = {
  login: "Login",
  material_submission: "Envio de material",
  activity_complete: "Atividade concluída",
  course_enroll: "Matrícula",
  role_change: "Alteração de papel",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "medium" }).format(new Date(value));
}

export default function AdminAccessAuditPage() {
  const [events, setEvents] = useState<AccessEvent[]>([]);
  const [eventType, setEventType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ limit: "50", offset: String(offset) });
      if (eventType) params.set("eventType", eventType);
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const response = await fetch(`/api/admin/access-logs?${params.toString()}`, { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Não foi possível carregar a auditoria.");
      setEvents(body.events || []);
      setHasMore(Boolean(body.pagination?.hasMore));
    } catch (cause) {
      setEvents([]);
      setHasMore(false);
      setError(cause instanceof Error ? cause.message : "Não foi possível carregar os logs reais.");
    } finally {
      setLoading(false);
    }
  }, [eventType, from, offset, to]);

  useEffect(() => { void loadEvents(); }, [loadEvents]);

  function applyFilters(event: React.FormEvent) {
    event.preventDefault();
    setOffset(0);
  }

  return (
    <div className="page-container py-8 sm:py-10 space-y-8">
      <div>
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:underline mb-3"><ArrowLeft size={14} /> Voltar ao Admin</Link>
        <h1 className="text-3xl font-black text-foreground flex items-center gap-3"><ShieldCheck className="text-red-600" size={28} /> Auditoria de Acessos</h1>
        <p className="text-sm text-muted-foreground mt-2">Exibe somente eventos persistidos em `event_logs`; ausência de eventos permanece vazia.</p>
      </div>

      <form onSubmit={applyFilters} className="surface-card p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <select value={eventType} onChange={(event) => setEventType(event.target.value)} className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground"><option value="">Todos os eventos</option><option value="login">Login</option><option value="material_submission">Envio de material</option><option value="activity_complete">Atividade concluída</option><option value="course_enroll">Matrícula</option><option value="role_change">Alteração de papel</option></select>
        <label className="text-xs font-bold text-muted-foreground">De<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground" /></label>
        <label className="text-xs font-bold text-muted-foreground">Até<input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground" /></label>
        <button type="submit" className="self-end rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700">Aplicar filtros</button>
        <button type="button" onClick={() => { setEventType(""); setFrom(""); setTo(""); setOffset(0); }} className="self-end rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-foreground hover:bg-muted">Limpar</button>
      </form>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-800">{error}</div>}
      <div className="surface-card overflow-x-auto">
        {loading ? <div className="p-12 flex justify-center gap-3 text-sm text-muted-foreground"><Loader2 className="animate-spin" size={18} /> Consultando logs reais…</div> : events.length === 0 ? <div className="p-12 text-center text-sm text-muted-foreground">Nenhum evento persistido corresponde aos filtros.</div> : <table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-border text-xs uppercase text-muted-foreground"><tr><th className="px-4 py-3">Data</th><th className="px-4 py-3">Usuário</th><th className="px-4 py-3">Evento</th><th className="px-4 py-3">IP</th><th className="px-4 py-3">Detalhes</th></tr></thead><tbody>{events.map((event) => <tr key={event.id} className="border-b border-border last:border-0"><td className="px-4 py-3 whitespace-nowrap text-foreground">{formatDate(event.createdAt)}</td><td className="px-4 py-3 text-foreground">{event.userEmail || "Usuário não identificado"}</td><td className="px-4 py-3 font-bold text-foreground">{eventLabels[event.eventType] || event.eventType}</td><td className="px-4 py-3 text-muted-foreground">{event.ipAddress || "Não registrado"}</td><td className="px-4 py-3 text-muted-foreground max-w-sm truncate">{event.details || "Sem detalhes"}</td></tr>)}</tbody></table>}
      </div>
      <div className="flex justify-between gap-3"><button type="button" disabled={offset === 0 || loading} onClick={() => setOffset((current) => Math.max(0, current - 50))} className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-foreground disabled:opacity-50">Anterior</button><span className="self-center text-xs text-muted-foreground">Página {Math.floor(offset / 50) + 1}</span><button type="button" disabled={!hasMore || loading} onClick={() => setOffset((current) => current + 50)} className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-foreground disabled:opacity-50">Próxima</button></div>
    </div>
  );
}
