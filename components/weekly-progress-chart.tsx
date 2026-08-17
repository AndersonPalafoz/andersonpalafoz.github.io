'use client';

import { useState, useEffect } from "react";
import { TrendingUp, BarChart3, CheckCircle2, Award, Trophy, Star } from "lucide-react";

export function WeeklyProgressChart() {
  const [completedCount, setCompletedCount] = useState(3);
  const [traditionalMode, setTraditionalMode] = useState(false);

  useEffect(() => {
    const storedLessons = localStorage.getItem("ap_weekly_completed_lessons");
    if (storedLessons) {
      const parsed = parseInt(storedLessons, 10);
      if (!isNaN(parsed)) setCompletedCount(parsed);
    }

    const storedMode = localStorage.getItem("ap_traditional_mode");
    if (storedMode === "true") {
      setTraditionalMode(true);
    }
  }, []);

  const days = [
    { name: "Seg", lessons: 1 },
    { name: "Ter", lessons: 2 },
    { name: "Qua", lessons: 0 },
    { name: "Qui", lessons: Math.max(1, completedCount - 3) },
    { name: "Sex", lessons: 0 },
    { name: "Sáb", lessons: 0 },
    { name: "Dom", lessons: 0 },
  ];

  const maxLessons = Math.max(...days.map(d => d.lessons), 3);

  // Conquistas baseadas no progresso real
  const achievements = [
    {
      id: "first_step",
      title: "Primeiro Passo",
      description: "Conclua sua primeira aula na semana.",
      unlocked: completedCount >= 1,
      icon: Star,
      color: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300",
    },
    {
      id: "rhythm",
      title: "Ritmo Constante",
      description: "Complete 3 aulas ou mais no período.",
      unlocked: completedCount >= 3,
      icon: Trophy,
      color: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-300",
    },
    {
      id: "dedication",
      title: "Dicação Exemplar",
      description: "Atinga a meta semanal completa (5+ aulas).",
      unlocked: completedCount >= 5,
      icon: Award,
      color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300",
    },
  ];

  // Se o aluno estiver no modo tradicional, omitimos os elementos de gamificação conforme preferência
  if (traditionalMode) {
    return (
      <div className="surface-card p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="eyebrow">Modo Tradicional Ativo</span>
            <h2 className="text-xl font-black text-foreground">Registro de Frequência e Atividades</h2>
          </div>
          <span className="text-xs font-bold text-muted-foreground bg-muted px-3 py-1.5 rounded-xl">Modo Acadêmico</span>
        </div>
        <p className="text-xs text-muted-foreground">O progresso está sendo exibido em formato objetivo, focado em notas e presença sem elementos de gamificação.</p>
      </div>
    );
  }

  return (
    <div className="surface-card p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="eyebrow inline-flex items-center gap-1.5 text-red-600">
            <TrendingUp size={15} /> Progresso & Conquistas
          </span>
          <h2 className="text-xl font-black text-foreground">Evolução do Progresso Semanal</h2>
          <p className="text-xs text-muted-foreground">Acompanhe suas aulas concluídas e desbloqueie medalhas ao atingir suas metas.</p>
        </div>
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 px-3.5 py-2 rounded-2xl border border-red-200/60 text-xs font-black">
          <BarChart3 size={16} /> <span>{completedCount} Aulas Concluídas</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3 pt-4 items-end h-44 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
        {days.map((day) => {
          const heightPercent = Math.max(15, (day.lessons / maxLessons) * 100);
          return (
            <div key={day.name} className="flex flex-col items-center gap-2 h-full justify-end">
              <span className="text-[10px] font-black text-foreground">{day.lessons}</span>
              <div className="w-full max-w-[36px] bg-muted rounded-xl overflow-hidden h-full flex items-end">
                <div
                  className={`w-full rounded-xl transition-all duration-500 ${day.lessons > 0 ? "bg-red-600 shadow-sm" : "bg-slate-300 dark:bg-slate-700"}`}
                  style={{ height: `${day.lessons > 0 ? heightPercent : 8}%` }}
                />
              </div>
              <span className="text-xs font-bold text-muted-foreground">{day.name}</span>
            </div>
          );
        })}
      </div>

      {/* Seção de Conquistas e Medalhas Baseadas em Metas */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-foreground flex items-center gap-2">
            <Trophy size={16} className="text-amber-500" /> Medalhas da Semana
          </h3>
          <span className="text-[11px] font-bold text-muted-foreground">
            {achievements.filter(a => a.unlocked).length} de {achievements.length} conquistadas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {achievements.map((ach) => {
            const IconComponent = ach.icon;
            return (
              <div
                key={ach.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                  ach.unlocked
                    ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs"
                    : "bg-slate-100/60 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800/60 opacity-60 grayscale"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${ach.color}`}>
                  <IconComponent size={20} />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-foreground truncate">{ach.title}</h4>
                    {ach.unlocked ? (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">Desbloqueada</span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400">Bloqueada</span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{ach.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 size={15} /> <span>Conquistas atualizadas automaticamente conforme o progresso nas aulas e metas semanais.</span>
      </div>
    </div>
  );
}
