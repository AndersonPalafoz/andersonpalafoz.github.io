'use client';

import { useState } from "react";
import { Target, CheckCircle2, Plus, Trophy } from "lucide-react";
import { toast } from "sonner";

interface WeeklyGoal {
  id: string;
  title: string;
  completed: boolean;
  targetMinutes: number;
}

export function WeeklyGoalsWidget() {
  const [goals, setGoals] = useState<WeeklyGoal[]>([
    { id: "1", title: "Assistir a 3 videoaulas completas", completed: true, targetMinutes: 90 },
    { id: "2", title: "Praticar 2 atividades de speaking no navegador", completed: false, targetMinutes: 30 },
    { id: "3", title: "Baixar e ler 1 guia de gramática em PDF", completed: false, targetMinutes: 45 },
    { id: "4", title: "Participar do fórum com 1 dúvida ou dica", completed: true, targetMinutes: 20 }
  ]);

  const [newGoalTitle, setNewGoalTitle] = useState("");

  const toggleGoal = (id: string) => {
    setGoals(goals.map(g => {
      if (g.id === id) {
        const nextState = !g.completed;
        if (nextState) {
          toast.success("Parabéns! Meta semanal concluída com sucesso.");
        }
        return { ...g, completed: nextState };
      }
      return g;
    }));
  };

  const addGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    const created: WeeklyGoal = {
      id: String(Date.now()),
      title: newGoalTitle,
      completed: false,
      targetMinutes: 30
    };

    setGoals([...goals, created]);
    setNewGoalTitle("");
    toast.success("Nova meta semanal adicionada!");
  };

  const completedCount = goals.filter(g => g.completed).length;
  const progressPercentage = Math.round((completedCount / goals.length) * 100);

  return (
    <div className="surface-card p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="eyebrow inline-flex items-center gap-1.5">
            <Target size={14} /> Metas Semanais de Estudo
          </span>
          <h2 className="text-xl font-black text-foreground">Acompanhe seu Ritmo Acadêmico</h2>
          <p className="text-xs text-muted-foreground">Defina e conclua objetivos semanais para manter sua constância de aprendizado.</p>
        </div>
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 px-4 py-2.5 rounded-2xl">
          <Trophy className="text-red-600" size={22} />
          <div>
            <p className="text-[10px] font-black uppercase text-red-700 dark:text-red-300">Progresso Semanal</p>
            <p className="text-sm font-black text-red-900 dark:text-red-200">{completedCount} de {goals.length} concluídas ({progressPercentage}%)</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
          <div className="bg-red-600 h-full transition-all duration-500 rounded-full" style={{ width: `${progressPercentage}%` }} />
        </div>
      </div>

      <div className="space-y-3">
        {goals.map((goal) => (
          <div
            key={goal.id}
            onClick={() => toggleGoal(goal.id)}
            className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-4 ${
              goal.completed 
                ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200" 
                : "bg-card border-border hover:border-red-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                goal.completed ? "bg-emerald-600 text-white" : "border-2 border-slate-300 dark:border-slate-600 text-transparent"
              }`}>
                {goal.completed && <CheckCircle2 size={14} />}
              </div>
              <span className={`text-xs sm:text-sm font-bold ${goal.completed ? "line-through opacity-80" : "text-foreground"}`}>
                {goal.title}
              </span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-muted px-2.5 py-1 rounded-full text-muted-foreground shrink-0">
              {goal.targetMinutes} min
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={addGoal} className="flex gap-2 pt-2 border-t border-border/70">
        <input
          type="text"
          placeholder="Adicionar nova meta semanal..."
          value={newGoalTitle}
          onChange={(e) => setNewGoalTitle(e.target.value)}
          className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-xs font-bold text-foreground focus:outline-red-600 shadow-xs"
        />
        <button
          type="submit"
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shrink-0"
        >
          <Plus size={16} /> Adicionar Meta
        </button>
      </form>
    </div>
  );
}
