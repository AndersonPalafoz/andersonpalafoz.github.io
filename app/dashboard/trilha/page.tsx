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

  if (loading) return <div className="surface-card flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground"><Loader2 className="animate-spin" size={18} /> Consultando seu histórico real…</div>;
  if (error) return <div className="surface-card p-8 text-sm text-muted-foreground">Não foi possível carregar as recomendações baseadas no seu histórico.</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 font-sans">
      <header className="rounded-3xl bg-gradient-to-r from-red-700 to-red-500 p-8 text-white shadow-xl"><div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider"><Compass size={15} /> Trilha baseada no seu histórico</div><h1 className="mt-4 text-3xl font-black tracking-tight">Revisões recomendadas</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-white/90">As sugestões abaixo só aparecem quando há atividades ou notas reais registradas na sua conta que justificam uma revisão.</p><div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold"><BookOpen size={15} /> {sourceCount} registro(s) analisado(s)</div></header>

      {recommendations.length === 0 ? <section className="surface-card border-dashed p-10 text-center"><ShieldAlert className="mx-auto text-muted-foreground" size={28} /><h2 className="mt-4 text-lg font-black text-foreground">Ainda não há recomendações baseadas em dados</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">Nenhuma atividade pendente ou nota abaixo do limite de revisão foi encontrada nos registros da sua conta. A trilha não cria sugestões genéricas.</p></section> : <section className="space-y-4"><div className="flex items-center justify-between"><h2 className="text-xl font-black text-foreground">Recomendações encontradas</h2><span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">{recommendations.length} item(ns)</span></div><div className="grid gap-4">{recommendations.map((recommendation) => <article key={recommendation.id} className="surface-card flex flex-col items-start justify-between gap-5 p-6 md:flex-row md:items-center"><div className="min-w-0 flex-1 space-y-2"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${recommendation.priority === "high" ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300" : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"}`}>Prioridade {recommendation.priority === "high" ? "alta" : "média"}</span>{recommendation.level && <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold text-muted-foreground">Nível {recommendation.level}</span>}{recommendation.sourceScore != null && <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold text-muted-foreground">Nota registrada: {recommendation.sourceScore}%</span>}</div><h3 className="text-base font-black text-foreground">{recommendation.topic}</h3><p className="text-xs leading-5 text-muted-foreground">{recommendation.reason}</p><p className="text-xs font-semibold text-foreground">Próxima ação: {recommendation.suggestedAction}</p></div><Link href={recommendation.targetUrl} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-red-700">Abrir curso <ArrowRight size={14} /></Link></article>)}</div></section>}
    </div>
  );
}
