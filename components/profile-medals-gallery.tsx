"use client";

import { useEffect, useState } from "react";
import { Award, Lock, Loader2, Trophy } from "lucide-react";

interface Medal {
  id: number;
  code: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  requirement: string;
  awardedAt: string | null;
  unlocked: boolean;
}

export function ProfileMedalsGallery() {
  const [medals, setMedals] = useState<Medal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [traditionalMode, setTraditionalMode] = useState(false);

  useEffect(() => {
    setTraditionalMode(window.localStorage.getItem("ap_traditional_mode") === "true");
    let cancelled = false;
    fetch("/api/user/medals", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Não foi possível carregar as medalhas.");
        if (!cancelled) setMedals(payload.medals || []);
      })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (traditionalMode) {
    return <div className="surface-card space-y-3 p-6 sm:p-8"><span className="eyebrow">Modo Tradicional Ativo</span><h3 className="text-xl font-black text-foreground">Registro acadêmico oficial</h3><p className="text-xs leading-5 text-muted-foreground">A galeria de conquistas está ocultada pela preferência do modo tradicional.</p></div>;
  }

  if (loading) return <div className="surface-card flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground"><Loader2 className="animate-spin" size={18} /> Consultando medalhas reais…</div>;
  if (error) return <div className="surface-card p-8 text-sm text-muted-foreground">Não foi possível consultar o catálogo de medalhas.</div>;

  const unlockedCount = medals.filter((medal) => medal.unlocked).length;

  return (
    <section className="surface-card space-y-6 p-6 sm:p-8" aria-labelledby="medals-title">
      <div className="flex flex-col gap-3 border-b border-border/70 pb-5 sm:flex-row sm:items-start sm:justify-between"><div><span className="eyebrow inline-flex items-center gap-1.5 text-red-600"><Trophy size={15} /> Catálogo persistido</span><h2 id="medals-title" className="mt-1 text-xl font-black text-foreground">Medalhas e emblemas</h2><p className="mt-1 text-xs text-muted-foreground">O estado de cada medalha é calculado pela concessão registrada para sua conta.</p></div><div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-black text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200"><Award className="mr-1 inline" size={15} /> {unlockedCount} de {medals.length} conquistadas</div></div>

      {medals.length === 0 ? <div className="rounded-2xl border border-dashed border-border p-8 text-center"><Trophy className="mx-auto text-muted-foreground" size={26} /><p className="mt-3 text-sm font-bold text-foreground">Nenhuma medalha foi cadastrada no catálogo.</p><p className="mt-1 text-xs text-muted-foreground">A galeria não cria medalhas automaticamente.</p></div> : <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{medals.map((medal) => <article key={medal.code} className={`flex flex-col justify-between gap-4 rounded-3xl border p-5 ${medal.unlocked ? "border-slate-200 bg-card dark:border-slate-800" : "border-border/70 bg-muted/30 opacity-65 grayscale"}`}><div className="flex items-start justify-between gap-3"><div className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-xl ${medal.unlocked ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200" : "border-border bg-muted text-muted-foreground"}`}>{medal.icon || <Trophy size={22} />}</div>{medal.unlocked ? <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">Conquistada</span> : <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold text-muted-foreground"><Lock size={12} /> Bloqueada</span>}</div><div><span className="text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400">{medal.category}</span><h3 className="mt-1 text-base font-black text-foreground">{medal.title}</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">{medal.description}</p><p className="mt-3 text-[11px] font-semibold text-muted-foreground">Critério: {medal.requirement}</p></div>{medal.awardedAt && <p className="border-t border-border pt-3 text-[11px] font-bold text-muted-foreground">Concedida em {new Date(medal.awardedAt).toLocaleDateString("pt-BR")}</p>}</article>)}</div>}
    </section>
  );
}
