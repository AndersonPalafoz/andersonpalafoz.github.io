"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, BarChart3, BookOpen, Loader2 } from "lucide-react";

interface DaySummary {
  key: string;
  label: string;
  lessons: number;
  activities: number;
}

interface WeeklySummary {
  days: DaySummary[];
  totals: { lessons: number; activities: number };
}

export function WeeklyProgressChart() {
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [traditionalMode, setTraditionalMode] = useState(false);

  useEffect(() => {
    setTraditionalMode(window.localStorage.getItem("ap_traditional_mode") === "true");
    let cancelled = false;
    fetch("/api/dashboard/weekly-summary", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Falha ao carregar o progresso semanal.");
        if (!cancelled) setSummary(payload);
      })
      .catch(() => {
        if (!cancelled) setSummary(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const total = useMemo(() => summary ? summary.totals.lessons + summary.totals.activities : 0, [summary]);
  const max = useMemo(() => summary ? Math.max(...summary.days.map((day) => day.lessons + day.activities), 1) : 1, [summary]);

  if (loading) {
    return <div className="surface-card flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground"><Loader2 className="animate-spin" size={18} /> Carregando progresso real…</div>;
  }

  if (!summary) {
    return <div className="surface-card p-6 text-sm text-muted-foreground">O progresso semanal não está disponível neste momento.</div>;
  }

  if (traditionalMode) {
    return (
      <section className="surface-card space-y-3 p-6 sm:p-8" aria-labelledby="traditional-progress-title">
        <span className="eyebrow">Modo Tradicional Ativo</span>
        <h2 id="traditional-progress-title" className="text-xl font-black text-foreground">Registro de atividades concluídas</h2>
        <p className="text-sm leading-6 text-muted-foreground">{total === 0 ? "Nenhuma conclusão foi registrada nesta semana." : `${total} conclusão(ões) foram registradas nesta semana.`}</p>
      </section>
    );
  }

  return (
    <section className="surface-card space-y-6 p-6 sm:p-8" aria-labelledby="real-progress-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="eyebrow inline-flex items-center gap-1.5 text-red-600"><Activity size={15} /> Progresso persistido</span>
          <h2 id="real-progress-title" className="mt-1 text-xl font-black text-foreground">Evolução semanal real</h2>
          <p className="text-xs leading-5 text-muted-foreground">O gráfico é calculado a partir das conclusões registradas no banco de dados.</p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-black text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200"><BarChart3 size={16} /> {total} conclusão(ões)</div>
      </div>

      {total === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center"><BookOpen className="mx-auto text-muted-foreground" size={24} /><p className="mt-3 text-sm font-bold text-foreground">Sem dados de progresso nesta semana.</p><p className="mt-1 text-xs text-muted-foreground">As barras aparecerão depois que uma aula ou atividade for concluída.</p></div>
      ) : (
        <div className="grid h-48 grid-cols-7 items-end gap-2 rounded-2xl border border-border bg-muted/30 p-4 sm:gap-3 sm:p-6">
          {summary.days.map((day) => {
            const count = day.lessons + day.activities;
            const height = count === 0 ? 8 : Math.max(15, (count / max) * 100);
            return (
              <div key={day.key} className="flex h-full flex-col items-center justify-end gap-2"><span className="text-[10px] font-black text-foreground">{count}</span><div className="flex h-full w-full max-w-9 items-end overflow-hidden rounded-xl bg-background"><div className={`w-full rounded-xl ${count > 0 ? "bg-red-600" : "bg-muted"}`} style={{ height: `${height}%` }} /></div><span className="text-[11px] font-bold text-muted-foreground">{day.label}</span></div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-border bg-background p-4"><p className="text-2xl font-black text-foreground">{summary.totals.lessons}</p><p className="text-xs font-semibold text-muted-foreground">Aulas concluídas</p></div><div className="rounded-2xl border border-border bg-background p-4"><p className="text-2xl font-black text-foreground">{summary.totals.activities}</p><p className="text-xs font-semibold text-muted-foreground">Atividades concluídas</p></div></div>
    </section>
  );
}
