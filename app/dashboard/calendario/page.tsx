"use client";

import { useCallback, useEffect, useState } from "react";
import { Calendar, CheckCircle2, Clock, Database, ExternalLink, Loader2, RefreshCw, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  status: string;
  source: "database" | "google";
  kind: string;
};

type CalendarPayload = {
  eventos: CalendarEvent[];
  sources: { database: number; google: number };
  google: { connected: boolean; message?: string; code?: string };
  fetchedAt: string;
};

export default function CalendarioPage() {
  const [payload, setPayload] = useState<CalendarPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  const loadCalendar = useCallback(async (manual = false) => {
    try {
      manual ? setSyncing(true) : setLoading(true);
      const response = await fetch("/api/calendar", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível carregar o calendário.");
      setPayload(data);
      setLastFetched(data.fetchedAt || new Date().toISOString());
      if (manual) {
        if (data.google?.connected) toast.success("Banco de dados e Google Calendar consultados novamente.");
        else toast.success("Dados acadêmicos do banco atualizados. O Google Calendar não está conectado nesta sessão.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível carregar os dados do calendário.");
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  useEffect(() => { void loadCalendar(); }, [loadCalendar]);

  const handleSync = async () => {
    try {
      setSyncing(true);
      const response = await fetch("/api/calendar", { method: "POST", cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível atualizar o calendário.");
      setPayload(data);
      setLastFetched(data.fetchedAt || new Date().toISOString());
      if (data.google?.connected) toast.success("Consulta real ao Google Calendar concluída.");
      else toast.success("Consulta real ao banco concluída; o Google Calendar ainda não está conectado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar o calendário.");
    } finally {
      setSyncing(false);
    }
  };

  const events = payload?.eventos ?? [];
  const googleConnected = payload?.google.connected ?? false;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-border/70 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow">Área do aluno</span>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl">Calendário e prazos</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Eventos acadêmicos persistidos no banco e eventos realmente retornados pelo Google Calendar autorizado.</p>
        </div>
        <button type="button" onClick={handleSync} disabled={loading || syncing} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-xs font-black text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"><RefreshCw size={16} className={syncing ? "animate-spin" : ""} />{syncing ? "Consultando…" : "Atualizar dados reais"}</button>
      </header>

      <section className={`rounded-2xl border p-4 text-sm ${googleConnected ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-200" : "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-200"}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3"><span className="mt-0.5">{googleConnected ? <CheckCircle2 className="text-emerald-600" size={19} /> : <ShieldAlert className="text-amber-600" size={19} />}</span><div><p className="font-bold">{googleConnected ? "Google Calendar conectado nesta sessão" : "Google Calendar não conectado nesta sessão"}</p><p className="mt-1 text-xs opacity-80">{googleConnected ? "Os eventos abaixo incluem a resposta real do calendário principal autorizado." : payload?.google.message || "Os eventos do banco continuam disponíveis. Nenhum evento do Google será inventado."}</p></div></div>
          {!googleConnected && (
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => signIn("google", { callbackUrl: "/dashboard/calendario" }, { prompt: "consent", access_type: "offline", scope: "openid email profile https://www.googleapis.com/auth/calendar.readonly" })} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-current px-3 py-2 text-xs font-black transition hover:bg-black/5">
                <ExternalLink size={14} /> Autorizar Google Calendar
              </button>
              {payload?.google.code === "INSUFFICIENT_SCOPE" && (
                <a href="https://console.developers.google.com/apis/api/calendar-json.googleapis.com/overview?project=248382742983" target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-600 px-3 py-2 text-xs font-black text-white transition hover:bg-amber-700">
                  Ativar API no Google Cloud
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="surface-card p-4"><p className="text-2xl font-black text-foreground">{events.length}</p><p className="text-xs font-semibold text-muted-foreground">Eventos exibidos</p></div>
        <div className="surface-card p-4"><p className="text-2xl font-black text-foreground">{payload?.sources.database ?? 0}</p><p className="text-xs font-semibold text-muted-foreground">Registros do banco</p></div>
        <div className="surface-card p-4"><p className="text-2xl font-black text-foreground">{payload?.sources.google ?? 0}</p><p className="text-xs font-semibold text-muted-foreground">Eventos do Google</p></div>
      </section>

      {lastFetched && <p className="text-xs text-muted-foreground">Última consulta real: {new Date(lastFetched).toLocaleString("pt-BR")}</p>}

      {loading ? (
        <div className="surface-card flex items-center justify-center gap-2 p-12 text-sm text-muted-foreground"><Loader2 className="animate-spin text-red-600" size={20} /> Consultando dados reais…</div>
      ) : events.length === 0 ? (
        <div className="surface-card border-dashed p-12 text-center"><Calendar className="mx-auto text-muted-foreground" size={42} /><p className="mt-4 text-base font-black text-foreground">Nenhum evento encontrado no período consultado.</p><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Isso significa que não há prazos persistidos para seus cursos e, {googleConnected ? "neste período, o Google Calendar também não retornou eventos." : "como a conta Google não está conectada, somente os dados do banco foram consultados."}</p></div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <article key={event.id} className="surface-card flex flex-col gap-4 p-5 transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-4"><div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${event.source === "google" ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"}`}>{event.source === "google" ? <Calendar size={22} /> : <Database size={22} />}</div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate text-base font-black text-foreground">{event.title}</h2><span className="rounded-full bg-muted px-2 py-1 text-[10px] font-black uppercase text-muted-foreground">{event.source === "google" ? "Google Calendar" : "Banco"}</span></div><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Clock size={13} /> {new Date(event.start).toLocaleString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p></div></div><span className="rounded-full bg-amber-100 px-3.5 py-1.5 text-xs font-black uppercase text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">{event.status}</span>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
