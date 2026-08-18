"use client";

import { useEffect, useState } from "react";
import { Activity, BookOpen, CheckCircle2, Clock3, Loader2 } from "lucide-react";

interface DaySummary {
  key: string;
  label: string;
  date: string;
  lessons: number;
  activities: number;
}

interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  days: DaySummary[];
  totals: { lessons: number; activities: number };
}

export function WeeklyGoalsWidget() {
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [traditionalMode, setTraditionalMode] = useState(false);

  useEffect(() => {
    const storedMode = window.localStorage.getItem("ap_traditional_mode");
    setTraditionalMode(storedMode === "true");

    let cancelled = false;
    fetch("/api/dashboard/weekly-summary", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Não foi possível carregar o resumo semanal.");
        if (!cancelled) setSummary(payload);
      })
      .catch((cause) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Não foi possível carregar o resumo semanal.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return <div className="surface-card flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground"><Loader2 className="animate-spin" size={18} /> Carregando atividades reais da semana…</div>;
  }

  if (error) {
    return <div className="surface-card border-amber-200 bg-amber-50/60 p-6 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-200">Não foi possível carregar o resumo semanal. Tente atualizar a página.</div>;
  }

  if (!summary) return null;

  const totalItems = summary.totals.lessons + summary.totals.activities;
  const maxItems = Math.max(...summary.days.map((day) => day.lessons + day.activities), 1);

  if (traditionalMode) {
    return (
      <section className="surface-card space-y-4 p-6 sm:p-8" aria-labelledby="weekly-summary-title">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="eyebrow">Modo Tradicional</span>
            <h2 id="weekly-summary-title" className="mt-1 text-xl font-black text-foreground">Registro semanal de estudo</h2>
            <p className="mt-1 text-xs text-muted-foreground">Somente atividades concluídas que foram registradas no banco.</p>
          </div>
          <div className="rounded-2xl bg-muted px-4 py-3 text-center">
            <p className="text-2xl font-black text-foreground">{totalItems}</p>
            <p className="text-[11px] font-bold text-muted-foreground">registros reais</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{totalItems === 0 ? "Nenhuma aula ou atividade concluída foi registrada nesta semana." : `${summary.totals.lessons} aula(s) e ${summary.totals.activities} atividade(s) concluída(s) nesta semana.`}</p>
      </section>
    );
  }

  return (
    <section className="surface-card space-y-6 p-6 sm:p-8" aria-labelledby="weekly-summary-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="eyebrow inline-flex items-center gap-1.5"><Activity size={14} /> Dados reais da semana</span>
          <h2 id="weekly-summary-title" className="mt-1 text-xl font-black text-foreground">Seu ritmo de estudo</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Acompanhe apenas aulas e atividades concluídas e persistidas na plataforma.</p>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center dark:border-red-900/60 dark:bg-red-950/30">
          <p className="text-2xl font-black text-red-700 dark:text-red-200">{totalItems}</p>
          <p className="text-[11px] font-bold text-red-800/70 dark:text-red-200/70">conclusões na semana</p>
        </div>
      </div>

      {totalItems === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-6 text-center">
          <BookOpen className="mx-auto text-muted-foreground" size={24} />
          <p className="mt-3 text-sm font-bold text-foreground">Ainda não há conclusões registradas nesta semana.</p>
          <p className="mt-1 text-xs text-muted-foreground">Quando você concluir uma aula ou atividade, ela aparecerá aqui automaticamente.</p>
        </div>
      ) : (
        <div className="grid h-44 grid-cols-7 items-end gap-2 rounded-2xl border border-border bg-muted/30 p-4 sm:gap-3 sm:p-6">
          {summary.days.map((day) => {
            const total = day.lessons + day.activities;
            const height = total === 0 ? 8 : Math.max(15, (total / maxItems) * 100);
            return (
              <div key={day.key} className="flex h-full flex-col items-center justify-end gap-2">
                <span className="text-[10px] font-black text-foreground">{total}</span>
                <div className="flex h-full w-full max-w-9 items-end overflow-hidden rounded-xl bg-background">
                  <div className={`w-full rounded-xl transition-all ${total > 0 ? "bg-red-600" : "bg-muted"}`} style={{ height: `${height}%` }} />
                </div>
                <span className="text-[11px] font-bold text-muted-foreground">{day.label}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-background p-4"><CheckCircle2 className="text-emerald-600" size={19} /><div><p className="text-lg font-black text-foreground">{summary.totals.lessons}</p><p className="text-xs font-semibold text-muted-foreground">Aulas concluídas</p></div></div>
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-background p-4"><Clock3 className="text-blue-600" size={19} /><div><p className="text-lg font-black text-foreground">{summary.totals.activities}</p><p className="text-xs font-semibold text-muted-foreground">Atividades concluídas</p></div></div>
      </div>
    </section>
  );
}
