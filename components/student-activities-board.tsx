"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Clock3, FileCheck2, Filter, MessageSquare, Search } from "lucide-react";

type ActivityStatus = "completed" | "in_progress" | "pending";

export type StudentActivityItem = {
  id: number;
  title: string;
  description: string | null;
  dueDate: string | null;
  courseId: number | null;
  status: ActivityStatus;
  score: number | null;
  teacherFeedback: string | null;
  submittedAt: string | null;
  completedAt: string | null;
};

const statusMeta: Record<ActivityStatus, { label: string; className: string }> = {
  pending: { label: "Pendente", className: "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200" },
  in_progress: { label: "Em andamento", className: "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-200" },
  completed: { label: "Concluída", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200" },
};

function dueState(dueDate: string | null, status: ActivityStatus) {
  if (!dueDate || status === "completed") return null;
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(today.getDate() + 2);
  if (due < today) return { label: "Prazo vencido", className: "text-red-700 bg-red-50 border-red-200 dark:bg-red-950/30 dark:text-red-200 dark:border-red-900/60" };
  if (due <= dayAfterTomorrow) return { label: "Próximo prazo", className: "text-amber-800 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-900/60" };
  return null;
}

function formatDate(value: string | null) {
  return value ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(value)) : "Sem prazo";
}

export function StudentActivitiesBoard({ activities }: { activities: StudentActivityItem[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | ActivityStatus | "feedback">("all");
  const filteredActivities = useMemo(() => {
    const term = query.trim().toLowerCase();
    return [...activities]
      .filter((activity) => {
        const matchesText = !term || `${activity.title} ${activity.description || ""}`.toLowerCase().includes(term);
        const matchesFilter = filter === "all" || (filter === "feedback" ? Boolean(activity.teacherFeedback) : activity.status === filter);
        return matchesText && matchesFilter;
      })
      .sort((left, right) => {
        const leftDate = left.dueDate ? new Date(left.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        const rightDate = right.dueDate ? new Date(right.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        return left.status === "completed" && right.status !== "completed" ? 1 : left.status !== "completed" && right.status === "completed" ? -1 : leftDate - rightDate;
      });
  }, [activities, filter, query]);

  const pendingCount = activities.filter((activity) => activity.status !== "completed").length;
  const feedbackCount = activities.filter((activity) => Boolean(activity.teacherFeedback)).length;
  const dueSoonCount = activities.filter((activity) => dueState(activity.dueDate, activity.status)?.label === "Próximo prazo").length;

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-3" aria-label="Resumo de atividades">
        <article className="metric-card"><Clock3 className="text-amber-600" size={21} /><p className="mt-3 text-2xl font-black text-foreground">{pendingCount}</p><p className="text-sm font-semibold text-muted-foreground">Pendências ativas</p></article>
        <article className="metric-card"><AlertCircle className="text-red-600" size={21} /><p className="mt-3 text-2xl font-black text-foreground">{dueSoonCount}</p><p className="text-sm font-semibold text-muted-foreground">Próximos prazos</p></article>
        <article className="metric-card"><MessageSquare className="text-emerald-600" size={21} /><p className="mt-3 text-2xl font-black text-foreground">{feedbackCount}</p><p className="text-sm font-semibold text-muted-foreground">Feedbacks recebidos</p></article>
      </section>

      <section className="surface-card space-y-4 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="muted-label">Organize seu ritmo</p><h2 className="mt-1 text-xl font-black text-foreground">Suas atividades</h2></div>
          <p className="text-xs font-semibold text-muted-foreground">{filteredActivities.length} de {activities.length} atividade(s) visível(is)</p>
        </div>
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_13rem]">
          <label className="relative block"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} className="field-control w-full pl-9 text-sm" placeholder="Buscar atividade ou instrução" aria-label="Buscar atividades" /></label>
          <label className="relative block"><Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} /><select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)} className="field-control w-full appearance-none pl-9 text-sm"><option value="all">Todos os status</option><option value="pending">Pendentes</option><option value="in_progress">Em andamento</option><option value="completed">Concluídas</option><option value="feedback">Com feedback</option></select></label>
        </div>
      </section>

      {filteredActivities.length === 0 ? (
        <section className="empty-state p-8 text-center sm:p-12"><FileCheck2 className="mx-auto text-emerald-600" size={38} /><h2 className="mt-4 text-xl font-black text-foreground">Nenhuma atividade encontrada</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Ajuste a busca ou o filtro. Quando uma nova atividade for liberada, ela aparecerá aqui.</p></section>
      ) : (
        <section className="space-y-4" aria-label="Fila de atividades">
          {filteredActivities.map((activity) => {
            const due = dueState(activity.dueDate, activity.status);
            const meta = statusMeta[activity.status];
            return <article key={activity.id} className="surface-card min-w-0 space-y-4 rounded-3xl p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${meta.className}`}>{meta.label}</span>{due && <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${due.className}`}>{due.label}</span>}</div><h3 className="mt-3 break-words text-lg font-black text-foreground">{activity.title}</h3>{activity.description && <p className="mt-2 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{activity.description}</p>}</div>
                <div className="shrink-0 text-left text-xs sm:text-right"><p className="font-bold text-muted-foreground">Prazo</p><p className="mt-1 font-semibold text-foreground">{formatDate(activity.dueDate)}</p></div>
              </div>
              <div className="grid gap-3 border-t border-border/70 pt-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"><div className="min-w-0">{activity.score !== null && <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Avaliação registrada: {activity.score}%</p>}{activity.teacherFeedback && <div className="mt-2 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3 text-sm text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/25 dark:text-emerald-100"><p className="text-[10px] font-black uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Feedback do professor</p><p className="mt-1 whitespace-pre-wrap leading-6">{activity.teacherFeedback}</p></div>}{activity.submittedAt && <p className="mt-2 text-xs text-muted-foreground">Entrega registrada em {formatDate(activity.submittedAt)}.</p>}</div>{activity.courseId && <Link href={`/cursos/${activity.courseId}`} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-red-200 px-4 text-sm font-bold text-red-700 transition hover:bg-red-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/30">Abrir curso</Link>}</div>
            </article>;
          })}
        </section>
      )}
    </div>
  );
}
