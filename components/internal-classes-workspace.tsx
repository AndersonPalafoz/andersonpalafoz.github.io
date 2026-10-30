"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, CalendarDays, CheckCircle2, Search, Users } from "lucide-react";

type InternalClass = {
  id: number;
  offerName: string;
  academicTerm: string;
  institution: string | null;
  status: string;
  modality: string | null;
  classDays: string | null;
  classTime: string | null;
  workloadHours: number | null;
  durationType: string | null;
  durationValue: number | null;
  durationUnit: string | null;
  courseTitle: string;
  courseLevel: string;
  studentCount: number;
};

const periodLabels: Record<string, string> = { monthly: "Mensal", bimonthly: "Bimestral", quarterly: "Trimestral", semester: "Semestral", annual: "Anual" };

function formatDuration(item: Pick<InternalClass, "durationType" | "durationValue" | "durationUnit" | "workloadHours">) {
  if (item.durationType === "workload") return `${item.workloadHours ?? item.durationValue ?? 0} hora(s)`;
  const label = periodLabels[item.durationUnit ?? ""];
  return label ? `${item.durationValue && item.durationValue > 1 ? `${item.durationValue} × ` : ""}${label}` : "Duração não informada";
}

export function InternalClassesWorkspace({ classes, canCreate }: { classes: InternalClass[]; canCreate: boolean }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const filtered = useMemo(() => classes.filter((item) => {
    const haystack = `${item.offerName} ${item.courseTitle} ${item.academicTerm} ${item.institution ?? ""}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (status === "all" || item.status === status);
  }), [classes, query, status]);

  return <section className="space-y-5">
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-300" size={17} aria-hidden="true" /><label htmlFor="internal-class-search" className="sr-only">Pesquisar turma interna</label><input id="internal-class-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar turma, curso ou período" className="w-full rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950 py-2.5 pl-10 pr-3 text-sm text-slate-900 dark:text-white outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20" /></div>
      <div className="flex flex-wrap items-center gap-2"><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filtrar por status" className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"><option value="all">Todos os status</option><option value="published">Publicadas</option><option value="draft">Rascunhos</option><option value="archived">Arquivadas</option></select>{canCreate && <Link href="/professor/turmas-internas?new=internal-class" className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-red-600 px-3.5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">Nova turma</Link>}</div>
    </div>
    {filtered.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900"><BookOpen className="mx-auto text-red-500" size={28} aria-hidden="true" /><h2 className="mt-3 font-bold text-slate-900 dark:text-white">Nenhuma turma interna cadastrada</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">Esta área mostra somente turmas criadas para funcionar dentro da plataforma. Turmas externas e turmas SIMAL aparecem na Área externa.</p>{canCreate && <p className="mt-4 text-sm font-semibold text-red-600">Crie a primeira turma interna usando um curso disponível na plataforma.</p>}</div> : <div className="grid gap-4 lg:grid-cols-2">{filtered.map((item) => <Link key={item.id} href={`/professor/turmas-internas/${item.id}`} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition hover:-translate-y-0.5 hover:border-red-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"><div className="flex items-start justify-between gap-3"><div><span className="text-xs font-black uppercase tracking-wider text-red-600">{item.courseLevel} · {item.academicTerm}</span><h2 className="mt-1 text-lg font-black text-slate-900 dark:text-white">{item.offerName}</h2><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.courseTitle}{item.institution ? ` · ${item.institution}` : ""}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.status === "published" ? "border border-slate-200 bg-slate-100 text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-emerald-300" : "border border-slate-200 bg-slate-100 text-amber-700 dark:border-slate-700 dark:bg-slate-900 dark:text-amber-300"}`}>{item.status === "published" ? "Publicada" : item.status === "archived" ? "Arquivada" : "Rascunho"}</span></div><div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-slate-600 dark:text-slate-300"><span className="inline-flex items-center gap-1.5"><Users size={14} aria-hidden="true" /> {item.studentCount} aluno(s) interno(s)</span><span className="inline-flex items-center gap-1.5"><CalendarDays size={14} aria-hidden="true" /> {item.classDays || "Agenda a definir"}{item.classTime ? ` · ${item.classTime}` : ""}</span><span className="inline-flex items-center gap-1.5"><BookOpen size={14} aria-hidden="true" /> {formatDuration(item)}</span><span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} aria-hidden="true" /> {item.modality || "Modalidade a definir"}</span></div><div className="mt-5 flex items-center justify-end gap-1 text-sm font-bold text-red-600">Gerenciar turma <ArrowRight size={15} className="transition group-hover:translate-x-1" aria-hidden="true" /></div></Link>)}</div>}
  </section>;
}

export type { InternalClass };
