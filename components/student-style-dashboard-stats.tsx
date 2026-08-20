"use client";

import { BookOpen, CheckSquare, Award, Users, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsProps {
  coursesCount: number;
  studentsCount: number;
  materialsCount: number;
  enrollmentsCount: number;
  isLoading?: boolean;
}

export function StudentStyleDashboardStats({ coursesCount, studentsCount, materialsCount, enrollmentsCount, isLoading = false }: StatsProps) {
  const metrics = [
    { label: "Cursos Publicados", value: coursesCount, icon: BookOpen, tone: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300" },
    { label: "Alunos Cadastrados", value: studentsCount, icon: Users, tone: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" },
    { label: "Materiais Didáticos", value: materialsCount, icon: CheckSquare, tone: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" },
    { label: "Matrículas Ativas", value: enrollmentsCount, icon: Award, tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" },
  ];

  if (isLoading) {
    return (
      <section aria-label="Painel de Resumo Estatístico em Carregamento" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="surface-card p-5 sm:p-6 rounded-3xl border border-border/80 bg-card shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-4">
              <Skeleton className="h-12 w-12 rounded-2xl" />
              <Skeleton className="h-8 w-16 rounded-lg" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-4 w-12 rounded-md" />
            </div>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section aria-label="Painel de Resumo Estatístico" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map(({ label, value, icon: Icon, tone }) => (
        <article key={label} className="surface-card interactive-card p-5 sm:p-6 rounded-3xl border border-border/80 bg-card shadow-xs transition hover:shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}>
              <Icon size={22} />
            </div>
            <span className="text-3xl font-black tracking-tight text-foreground">{value}</span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-muted-foreground">{label}</p>
            <span className="flex items-center text-[11px] font-bold text-emerald-600 gap-0.5">
              <TrendingUp size={12} /> Ativo
            </span>
          </div>
        </article>
      ))}
    </section>
  );
}
