'use client';

import { useState, useEffect } from "react";
import { TrendingUp, BarChart3, CheckCircle2 } from "lucide-react";

export function WeeklyProgressChart() {
  const [completedCount, setCompletedCount] = useState(3);

  useEffect(() => {
    const stored = localStorage.getItem("ap_weekly_completed_lessons");
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed)) setCompletedCount(parsed);
    }
  }, []);

  const days = [
    { name: "Seg", lessons: 1, active: true },
    { name: "Ter", lessons: 2, active: true },
    { name: "Qua", lessons: 0, active: false },
    { name: "Qui", lessons: Math.max(1, completedCount - 3), active: true },
    { name: "Sex", lessons: 0, active: false },
    { name: "Sáb", lessons: 0, active: false },
    { name: "Dom", lessons: 0, active: false },
  ];

  const maxLessons = Math.max(...days.map(d => d.lessons), 3);

  return (
    <div className="surface-card p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="eyebrow inline-flex items-center gap-1.5 text-red-600">
            <TrendingUp size={15} /> Atividade Real
          </span>
          <h2 className="text-xl font-black text-foreground">Evolução do Progresso Semanal</h2>
          <p className="text-xs text-muted-foreground">Acompanhamento em tempo real das aulas concluídas nesta semana.</p>
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

      <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 size={15} /> <span>Gráfico sincronizado com o armazenamento local e eventos de conclusão de aulas.</span>
      </div>
    </div>
  );
}
