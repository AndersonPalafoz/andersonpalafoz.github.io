"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CalendarDays, CheckCircle2, Layers3, Users } from "lucide-react";
import { shouldCelebrateProgress } from "@/lib/internal-class-progress";

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
  progressHasEvidence: boolean;
  totalLessons: number;
  completedLessons: number;
  totalActivities: number;
  completedActivities: number;
};

function StudentInternalClassCard({ item }: { item: StudentClass }) {
  const previousProgress = useRef<number | null>(null);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    const previous = previousProgress.current;
    previousProgress.current = item.progress;
    if (!shouldCelebrateProgress(previous, item.progress, item.progressHasEvidence)) return;

    setCelebrating(true);
    const timeout = window.setTimeout(() => setCelebrating(false), 900);
    return () => window.clearTimeout(timeout);
  }, [item.progress, item.progressHasEvidence]);

  const visibleProgress = item.progressHasEvidence ? item.progress : 0;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="text-xs font-black uppercase tracking-wider text-red-600">{item.courseLevel} · {item.academicTerm}</span>
          <h2 className="mt-1 text-lg font-black text-slate-900 dark:text-white">{item.offerName}</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.courseTitle}{item.institution ? ` · ${item.institution}` : ""}</p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-emerald-300">{item.status === "published" ? "Ativa" : "Em preparação"}</span>
      </div>
      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
        <span className="inline-flex items-center gap-1.5"><Users size={14} aria-hidden="true" /> Sua turma</span>
        <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} aria-hidden="true" /> {item.classDays || "Agenda a definir"}{item.classTime ? ` · ${item.classTime}` : ""}</span>
        <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} aria-hidden="true" /> {item.modality || "Modalidade a definir"}</span>
      </div>
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs font-bold"><span className="text-slate-600 dark:text-slate-300">Progresso no curso</span><span className="text-slate-900 dark:text-white">{item.progressHasEvidence ? `${item.progress}%` : "Sem dados"}</span></div>
        <div className={`relative mt-2 h-2 overflow-visible rounded-full bg-slate-200 dark:bg-slate-800 ${celebrating ? "progress-completion-celebrate" : ""}`} role="progressbar" aria-label={`Progresso de ${item.offerName}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={visibleProgress}>
          <div className={`h-full rounded-full transition-[width] duration-500 ease-out ${item.progressHasEvidence ? "bg-red-600" : "bg-muted-foreground/30"}`} style={{ width: `${visibleProgress}%` }} />
          {celebrating && <span className="progress-completion-glint" aria-hidden="true" />}
        </div>
        {celebrating && <p className="mt-2 text-xs font-bold text-emerald-700 dark:text-emerald-300" role="status">Progresso atualizado após uma nova conclusão.</p>}
        {!celebrating && <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{item.progressHasEvidence ? `${item.completedLessons}/${item.totalLessons} aulas e ${item.completedActivities}/${item.totalActivities} atividades concluídas.` : "Ainda não há aulas ou atividades com evidência de progresso."}</p>}
      </div>
      <Link href={`/dashboard/cursos/${item.id}`} className="mt-5 inline-flex rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-red-600 transition hover:border-red-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Acessar curso</Link>
    </article>
  );
}

export function StudentInternalClasses({ classes }: { classes: StudentClass[] }) {
  return (
    <section className="space-y-5">
      {classes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
          <Layers3 className="mx-auto text-slate-600 dark:text-slate-300" size={28} aria-hidden="true" />
          <h2 className="mt-3 font-bold text-slate-900 dark:text-white">Você ainda não está vinculado a uma turma</h2>
          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">Quando uma turma interna for liberada para você, ela aparecerá aqui com o curso, a agenda e o seu progresso.</p>
          <Link href="/dashboard/cursos" className="mt-5 inline-flex rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700">Ver meus cursos</Link>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {classes.map((item) => <StudentInternalClassCard key={item.id} item={item} />)}
        </div>
      )}
    </section>
  );
}

export type { StudentClass };
