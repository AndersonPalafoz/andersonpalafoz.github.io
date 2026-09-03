"use client";

import Link from "next/link";
import { CalendarDays, CheckCircle2, Layers3, Users } from "lucide-react";

type StudentClass = {
  id: number;
  offerName: string;
  academicTerm: string;
  courseTitle: string;
  courseLevel: string;
  institution: string | null;
  status: string;
  modality: string | null;
  classDays: string | null;
  classTime: string | null;
  progress: number;
};

export function StudentInternalClasses({ classes }: { classes: StudentClass[] }) {
  return (
    <section className="space-y-5">
      {classes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <Layers3 className="mx-auto text-muted-foreground" size={28} aria-hidden="true" />
          <h2 className="mt-3 font-bold text-foreground">Você ainda não está vinculado a uma turma</h2>
          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">Quando uma turma interna for liberada para você, ela aparecerá aqui com o curso, a agenda e o seu progresso.</p>
          <Link href="/dashboard/cursos" className="mt-5 inline-flex rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700">Ver meus cursos</Link>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {classes.map((item) => (
            <article key={item.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-xs font-black uppercase tracking-wider text-red-600">{item.courseLevel} · {item.academicTerm}</span>
                  <h2 className="mt-1 text-lg font-black text-foreground">{item.offerName}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{item.courseTitle}{item.institution ? ` · ${item.institution}` : ""}</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{item.status === "published" ? "Ativa" : "Em preparação"}</span>
              </div>
              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Users size={14} aria-hidden="true" /> Sua turma</span>
                <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} aria-hidden="true" /> {item.classDays || "Agenda a definir"}{item.classTime ? ` · ${item.classTime}` : ""}</span>
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} aria-hidden="true" /> {item.modality || "Modalidade a definir"}</span>
              </div>
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs font-bold"><span className="text-muted-foreground">Progresso no curso</span><span className="text-foreground">{item.progress}%</span></div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-red-600 transition-all" style={{ width: `${item.progress}%` }} /></div>
              </div>
              <Link href={`/dashboard/cursos/${item.id}`} className="mt-5 inline-flex text-sm font-bold text-red-600 hover:underline">Acessar curso</Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export type { StudentClass };
