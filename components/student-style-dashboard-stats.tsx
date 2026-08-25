"use client";

import React from "react";
import { BookOpen, CheckSquare, Award, Users, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsProps {
  coursesCount: number;
  studentsCount: number;
  materialsCount: number;
  enrollmentsCount: number;
  isLoading?: boolean;
  contextLabel?: string;
  contextDescription?: string;
}

const metricDefinitions = [
  { key: "coursesCount", label: "Cursos publicados", icon: BookOpen, tone: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300", accent: "border-t-red-500" },
  { key: "studentsCount", label: "Alunos cadastrados", icon: Users, tone: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300", accent: "border-t-blue-500" },
  { key: "materialsCount", label: "Materiais didáticos", icon: CheckSquare, tone: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300", accent: "border-t-amber-500" },
  { key: "enrollmentsCount", label: "Matrículas ativas", icon: Award, tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300", accent: "border-t-emerald-500" },
] as const;

export function StudentStyleDashboardStats({ coursesCount, studentsCount, materialsCount, enrollmentsCount, isLoading = false, contextLabel = "Visão geral", contextDescription = "Indicadores essenciais da sua operação acadêmica." }: StatsProps) {
  const values = { coursesCount, studentsCount, materialsCount, enrollmentsCount };
  if (isLoading) return <section aria-label={`${contextLabel} em carregamento`} className="space-y-4"><div className="space-y-1"><span className="muted-label">{contextLabel}</span><Skeleton className="h-7 w-48 rounded-lg" /></div><div className="grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">{metricDefinitions.map(({ key }) => <div key={key} className="surface-card min-w-0 rounded-3xl border border-border/80 border-t-4 border-t-muted p-4 shadow-xs sm:p-5"><div className="flex items-start justify-between gap-3"><Skeleton className="h-10 w-10 rounded-2xl" /><Skeleton className="h-8 w-14 rounded-lg" /></div><Skeleton className="mt-4 h-4 w-28 rounded-md" /><Skeleton className="mt-2 h-3 w-20 rounded-md" /></div>)}</div></section>;
  return <section aria-label={contextLabel} className="space-y-4"><div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-4"><div><span className="muted-label">{contextLabel}</span><h2 className="mt-1 text-xl font-black tracking-tight text-foreground sm:text-2xl">Resumo operacional</h2></div><p className="max-w-xl text-xs leading-5 text-muted-foreground sm:text-right sm:text-sm">{contextDescription}</p></div><div className="grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">{metricDefinitions.map(({ key, label, icon: Icon, tone, accent }) => <article key={key} className={`surface-card interactive-card min-w-0 rounded-3xl border border-border/80 border-t-4 ${accent} bg-card p-4 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md sm:p-5`}><div className="flex items-start justify-between gap-2 sm:gap-4"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl sm:h-12 sm:w-12 ${tone}`}><Icon size={20} aria-hidden="true" /></div><span className="truncate text-2xl font-black tracking-tight text-foreground sm:text-3xl">{values[key]}</span></div><div className="mt-4 min-w-0"><p className="truncate text-xs font-bold text-foreground sm:text-sm">{label}</p><span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground sm:text-[11px]"><TrendingUp size={12} aria-hidden="true" /> Atualizado</span></div></article>)}</div></section>;
}
