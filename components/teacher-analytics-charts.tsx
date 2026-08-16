"use client";

import { BarChart3, TrendingUp, Users } from "lucide-react";

interface TeacherAnalyticsChartsProps {
  totalStudents: number;
  activeStudents: number;
  averageProgress: number;
  totalEnrollments: number;
}

export function TeacherAnalyticsCharts({ totalStudents, activeStudents, averageProgress, totalEnrollments }: TeacherAnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="surface-card p-6 space-y-3">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-black uppercase tracking-wider">Engajamento de Alunos</span>
          <Users size={18} className="text-red-600" />
        </div>
        <div className="flex items-baseline justify-between">
          <p className="text-3xl font-black text-foreground">{activeStudents} <span className="text-sm font-normal text-muted-foreground">/ {totalStudents}</span></p>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Ativos</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
          <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${totalStudents ? Math.round((activeStudents / totalStudents) * 100) : 0}%` }} />
        </div>
        <p className="text-xs text-muted-foreground">Alunos com ao menos uma atividade ou progresso registrado.</p>
      </div>

      <div className="surface-card p-6 space-y-3">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-black uppercase tracking-wider">Progresso Médio Geral</span>
          <TrendingUp size={18} className="text-red-600" />
        </div>
        <div className="flex items-baseline justify-between">
          <p className="text-3xl font-black text-foreground">{averageProgress}%</p>
          <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Metodologia ESA</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
          <div className="bg-red-600 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, averageProgress))}%` }} />
        </div>
        <p className="text-xs text-muted-foreground">Média consolidada de conclusão de aulas em todos os cursos.</p>
      </div>

      <div className="surface-card p-6 space-y-3">
        <div className="flex items-center justify-between text-muted-foreground">
          <span className="text-xs font-black uppercase tracking-wider">Total de Matrículas</span>
          <BarChart3 size={18} className="text-red-600" />
        </div>
        <div className="flex items-baseline justify-between">
          <p className="text-3xl font-black text-foreground">{totalEnrollments}</p>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Ativas</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
          <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: "100%" }} />
        </div>
        <p className="text-xs text-muted-foreground">Inscrições ativas em cursos de inglês (A1 a C2).</p>
      </div>
    </div>
  );
}
