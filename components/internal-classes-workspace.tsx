"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, CalendarDays, CheckCircle2, Plus, Search, Users } from "lucide-react";

type InternalClass = {
  id: number;
  offerName: string;
  academicTerm: string;
  institution: string | null;
  status: string;
  modality: string | null;
  classDays: string | null;
  classTime: string | null;
  courseTitle: string;
  courseLevel: string;
  studentCount: number;
};

export function InternalClassesWorkspace({ classes, canCreate }: { classes: InternalClass[]; canCreate: boolean }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const filtered = useMemo(() => classes.filter((item) => {
    const haystack = `${item.offerName} ${item.courseTitle} ${item.academicTerm} ${item.institution ?? ""}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (status === "all" || item.status === status);
  }), [classes, query, status]);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={17} aria-hidden="true" />
          <label htmlFor="internal-class-search" className="sr-only">Pesquisar turma interna</label>
          <input id="internal-class-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar turma, curso ou período" className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-3 text-sm text-foreground outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20" />
        </div>
        <div className="flex items-center gap-2">
          <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filtrar por status" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-red-500">
            <option value="all">Todos os status</option>
            <option value="published">Publicadas</option>
            <option value="draft">Rascunhos</option>
            <option value="archived">Arquivadas</option>
          </select>
          {canCreate && <Link href="/professor/cursos" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-red-600 px-3.5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"><Plus size={16} /> Nova turma</Link>}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center"><BookOpen className="mx-auto text-muted-foreground" size={28} /><h2 className="mt-3 font-bold text-foreground">Nenhuma turma encontrada</h2><p className="mt-1 text-sm text-muted-foreground">Ajuste os filtros ou crie uma nova turma a partir de um curso interno.</p></div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((item) => <Link key={item.id} href={`/professor/turmas-internas/${item.id}`} className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-red-300 hover:shadow-md">
            <div className="flex items-start justify-between gap-3"><div><span className="text-xs font-black uppercase tracking-wider text-red-600">{item.courseLevel} · {item.academicTerm}</span><h2 className="mt-1 text-lg font-black text-foreground">{item.offerName}</h2><p className="mt-1 text-sm text-muted-foreground">{item.courseTitle}{item.institution ? ` · ${item.institution}` : ""}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.status === "published" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"}`}>{item.status === "published" ? "Publicada" : item.status === "archived" ? "Arquivada" : "Rascunho"}</span></div>
            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-muted-foreground"><span className="inline-flex items-center gap-1.5"><Users size={14} /> {item.studentCount} aluno(s)</span><span className="inline-flex items-center gap-1.5"><CalendarDays size={14} /> {item.classDays || "Agenda a definir"}{item.classTime ? ` · ${item.classTime}` : ""}</span><span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} /> {item.modality || "Modalidade a definir"}</span></div>
            <div className="mt-5 flex items-center justify-end gap-1 text-sm font-bold text-red-600">Gerenciar turma <ArrowRight size={15} className="transition group-hover:translate-x-1" /></div>
          </Link>)}
        </div>
      )}
    </section>
  );
}

export type { InternalClass };
