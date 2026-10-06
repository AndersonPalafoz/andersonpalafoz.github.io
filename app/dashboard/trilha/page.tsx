"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Compass, Loader2, ShieldAlert } from "lucide-react";

type Recommendation = {
  id: string;
  topic: string;
  reason: string;
  suggestedAction: string;
  targetUrl: string;
  priority: "high" | "medium";
  level?: string | null;
  sourceActivityId: number;
  sourceScore?: number | null;
};

export default function AdaptiveLearningPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [sourceCount, setSourceCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/dashboard/trilha", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Não foi possível carregar a trilha.");
        if (!cancelled) { setRecommendations(payload.recommendations || []); setSourceCount(payload.sourceCount || 0); }
      })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <main className="flex min-h-48 items-center justify-center gap-2 bg-slate-50 p-10 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300"><Loader2 className="animate-spin" size={18} aria-label="Carregando trilha" /> Consultando seu histórico real…</main>;
  if (error) return <main className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">Não foi possível carregar as recomendações baseadas no seu histórico.</main>;

  return (
    <main className="mx-auto max-w-5xl space-y-8 bg-slate-50 px-4 py-8 font-sans text-slate-900 dark:bg-slate-950 dark:text-white">
      <header className="rounded-3xl border border-slate-200 bg-slate-900 p-8 text-white shadow-xl dark:border-slate-800 dark:bg-slate-950"><div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-black uppercase tracking-[0.16em]"><Compass size={15} aria-hidden="true" /> Trilha baseada no seu histórico</div><h1 className="mt-4 text-3xl font-black tracking-tight">Revisões recomendadas</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-white/90">As sugestões abaixo só aparecem quando há atividades ou notas reais registradas na sua conta que justificam uma revisão.</p><div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold"><BookOpen size={15} aria-hidden="true" /> {sourceCount} registro(s) analisado(s)</div></header>

      {recommendations.length === 0 ? <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900"><ShieldAlert className="mx-auto text-slate-600 dark:text-slate-300" size={28} /><h2 className="mt-4 text-lg font-black text-slate-900 dark:text-white">Ainda não há recomendações baseadas em dados</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600 dark:text-slate-300">Nenhuma atividade pendente ou nota abaixo do limite de revisão foi encontrada nos registros da sua conta. A trilha não cria sugestões genéricas.</p></section> : <section className="space-y-4"><div className="flex items-center justify-between"><h2 className="text-xl font-black text-slate-900 dark:text-white">Recomendações encontradas</h2><span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-slate-600 dark:text-slate-300">{recommendations.length} item(ns)</span></div><div className="grid gap-4">{recommendations.map((recommendation) => <article key={recommendation.id} className="surface-card flex flex-col items-start justify-between gap-5 p-6 md:flex-row md:items-center"><div className="min-w-0 flex-1 space-y-2"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${recommendation.priority === "high" ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300" : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"}`}>Prioridade {recommendation.priority === "high" ? "alta" : "média"}</span>{recommendation.level && <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-300">Nível {recommendation.level}</span>}{recommendation.sourceScore != null && <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-300">Nota registrada: {recommendation.sourceScore}%</span>}</div><h3 className="text-base font-black text-slate-900 dark:text-white">{recommendation.topic}</h3><p className="text-xs leading-5 text-slate-600 dark:text-slate-300">{recommendation.reason}</p><p className="text-xs font-semibold text-slate-900 dark:text-white">Próxima ação: {recommendation.suggestedAction}</p></div><Link href={recommendation.targetUrl} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-red-700">Abrir curso <ArrowRight size={14} /></Link></article>)}</div>      </section>}
    </main>
  );
}
