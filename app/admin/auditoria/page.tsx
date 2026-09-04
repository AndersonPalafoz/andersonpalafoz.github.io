'use client';

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Loader2, ShieldCheck } from "lucide-react";

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
  const [userSearch, setUserSearch] = useState("");
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
      if (userSearch.trim()) params.set("userSearch", userSearch.trim());
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
  }, [eventType, from, offset, to, userSearch]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadEvents(), 0);
    return () => window.clearTimeout(timer);
  }, [loadEvents]);

  function applyFilters(event: React.FormEvent) {
    event.preventDefault();
    setOffset(0);
  }

  function exportCSV() {
    if (events.length === 0) return;
    const escapeCell = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csv = ["Data,Usuario,Evento,IP,Detalhes", ...events.map((event) => [formatDate(event.createdAt), event.userEmail || "Usuário não identificado", eventLabels[event.eventType] || event.eventType, event.ipAddress || "Não registrado", event.details || "Sem detalhes"].map(escapeCell).join(","))].join("\\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([`\\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    link.download = `auditoria-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <div className="page-container py-8 sm:py-10 space-y-8">
      <div className="min-w-0 rounded-3xl border border-violet-200 bg-violet-50/55 p-5 dark:border-violet-900/60 dark:bg-violet-950/20 sm:p-7">
        <Link href="/admin" className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-violet-700 hover:underline dark:text-violet-300"><ArrowLeft size={14} /> Centro de superadministração</Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-700 dark:text-violet-300">Governança exclusiva</p><h1 className="mt-1 flex min-w-0 items-center gap-3 break-words text-3xl font-black text-foreground"><ShieldCheck className="shrink-0 text-violet-600" size={28} /> Auditoria de acessos</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">Consulte eventos persistidos, aplique filtros e exporte apenas os dados exibidos. O acesso é reservado ao superadministrador.</p></div>
          <span className="inline-flex shrink-0 rounded-full border border-violet-200 bg-white/80 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-violet-800 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-200">Logs reais</span>
        </div>
      </div>

      <form onSubmit={applyFilters} className="surface-card p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <label className="text-xs font-bold text-muted-foreground">Usuário ou email<input value={userSearch} onChange={(event) => setUserSearch(event.target.value)} placeholder="Buscar email" className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground" /></label>
        <select value={eventType} onChange={(event) => setEventType(event.target.value)} className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground"><option value="">Todos os eventos</option><option value="login">Login</option><option value="material_submission">Envio de material</option><option value="activity_complete">Atividade concluída</option><option value="course_enroll">Matrícula</option><option value="role_change">Alteração de papel</option></select>
        <label className="text-xs font-bold text-muted-foreground">De<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground" /></label>
        <label className="text-xs font-bold text-muted-foreground">Até<input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground" /></label>
        <button type="submit" className="self-end rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700">Aplicar filtros</button>
        <button type="button" onClick={() => { setEventType(""); setUserSearch(""); setFrom(""); setTo(""); setOffset(0); }} className="self-end rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-foreground hover:bg-muted">Limpar</button>
        <button type="button" onClick={exportCSV} disabled={loading || events.length === 0} className="inline-flex items-center justify-center gap-2 self-end rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-foreground hover:bg-muted disabled:opacity-50"><Download size={15} /> CSV da página</button>
      </form>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-800">{error}</div>}
      <div className="surface-card overflow-hidden">
        {loading ? <div className="p-12 flex justify-center gap-3 text-sm text-muted-foreground"><Loader2 className="animate-spin" size={18} /> Consultando logs reais…</div> : events.length === 0 ? <div className="p-12 text-center text-sm text-muted-foreground">Nenhum evento persistido corresponde aos filtros.</div> : <>
          <div className="space-y-3 p-3 md:hidden">{events.map((event) => <article key={event.id} className="rounded-2xl border border-border/70 bg-muted/20 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="break-all text-sm font-black text-foreground">{event.userEmail || "Usuário não identificado"}</p><p className="mt-1 text-xs font-bold text-violet-700 dark:text-violet-300">{eventLabels[event.eventType] || event.eventType}</p></div><time className="shrink-0 text-right text-[10px] font-semibold text-muted-foreground">{formatDate(event.createdAt)}</time></div><dl className="mt-3 grid gap-2 border-t border-border/60 pt-3 text-xs"><div><dt className="font-bold text-muted-foreground">IP</dt><dd className="mt-0.5 text-foreground">{event.ipAddress || "Não registrado"}</dd></div><div><dt className="font-bold text-muted-foreground">Detalhes</dt><dd className="mt-0.5 break-words text-foreground">{event.details || "Sem detalhes"}</dd></div></dl></article>)}</div>
          <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-border text-xs uppercase text-muted-foreground"><tr><th className="px-4 py-3">Data</th><th className="px-4 py-3">Usuário</th><th className="px-4 py-3">Evento</th><th className="px-4 py-3">IP</th><th className="px-4 py-3">Detalhes</th></tr></thead><tbody>{events.map((event) => <tr key={event.id} className="border-b border-border last:border-0"><td className="px-4 py-3 whitespace-nowrap text-foreground">{formatDate(event.createdAt)}</td><td className="px-4 py-3 text-foreground">{event.userEmail || "Usuário não identificado"}</td><td className="px-4 py-3 font-bold text-foreground">{eventLabels[event.eventType] || event.eventType}</td><td className="px-4 py-3 text-muted-foreground">{event.ipAddress || "Não registrado"}</td><td className="px-4 py-3 text-muted-foreground max-w-sm truncate">{event.details || "Sem detalhes"}</td></tr>)}</tbody></table></div>
        </>}
      </div>
      <div className="flex justify-between gap-3"><button type="button" disabled={offset === 0 || loading} onClick={() => setOffset((current) => Math.max(0, current - 50))} className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-foreground disabled:opacity-50">Anterior</button><span className="self-center text-xs text-muted-foreground">Página {Math.floor(offset / 50) + 1}</span><button type="button" disabled={!hasMore || loading} onClick={() => setOffset((current) => current + 50)} className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-foreground disabled:opacity-50">Próxima</button></div>
    </div>
  );
}
