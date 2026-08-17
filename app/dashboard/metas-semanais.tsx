'use client';

import { useState, useEffect } from "react";
import { Target, CheckCircle2, Plus, Trophy, History, Calendar } from "lucide-react";
import { toast } from "sonner";

interface WeeklyGoal {
  id: string;
  title: string;
  completed: boolean;
  targetMinutes: number;
}

interface MonthlyHistory {
  period: string;
  completedGoals: number;
  totalGoals: number;
  status: string;
}

export function WeeklyGoalsWidget() {
  const [goals, setGoals] = useState<WeeklyGoal[]>([
    { id: "1", title: "Assistir a 3 videoaulas completas", completed: true, targetMinutes: 90 },
    { id: "2", title: "Praticar 2 atividades de speaking no navegador", completed: false, targetMinutes: 30 },
    { id: "3", title: "Baixar e ler 1 guia de gramática em PDF", completed: false, targetMinutes: 45 },
    { id: "4", title: "Participar do fórum com 1 dúvida ou dica", completed: true, targetMinutes: 20 }
  ]);

  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);

  const [history] = useState<MonthlyHistory[]>([
    { period: "Julho / 2026", completedGoals: 18, totalGoals: 20, status: "Excelente (90%)" },
    { period: "Junho / 2026", completedGoals: 16, totalGoals: 20, status: "Muito Bom (80%)" },
    { period: "Maio / 2026", completedGoals: 19, totalGoals: 20, status: "Excelente (95%)" }
  ]);

  const completedCount = goals.filter(g => g.completed).length;
  const progressPercentage = Math.round((completedCount / goals.length) * 100);

  useEffect(() => {
    if (progressPercentage === 100) {
      setShowCelebration(true);
      toast.success("Incrível! Você atingiu 100% das metas semanais! 🏆🎉");
      const timer = setTimeout(() => setShowCelebration(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [progressPercentage]);

  const toggleGoal = (id: string) => {
    setGoals(goals.map(g => {
      if (g.id === id) {
        const nextState = !g.completed;
        if (nextState) {
          toast.success("Meta semanal concluída!");
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

  return (
    <div className="surface-card p-6 sm:p-8 space-y-6 relative overflow-hidden">
      {showCelebration && (
        <div className="absolute inset-0 bg-red-600/10 dark:bg-red-950/40 backdrop-blur-xs z-20 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border-2 border-red-500 p-6 rounded-3xl shadow-2xl max-w-md w-full space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl mx-auto flex items-center justify-center animate-bounce">
              <Trophy size={32} />
            </div>
            <h3 className="text-2xl font-black text-foreground">Parabéns, Aluno(a)!</h3>
            <p className="text-sm text-muted-foreground">Você concluiu 100% das suas metas semanais de estudo. Seu empenho está gerando grandes resultados na fluência!</p>
            <button
              type="button"
              onClick={() => setShowCelebration(false)}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold text-sm shadow transition"
            >
              Continuar Jornada
            </button>
          </div>
        </div>
      )}

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

      {/* Histórico de Metas Alcançadas em Meses Anteriores */}
      <div className="pt-6 border-t border-border/70 space-y-4">
        <div className="flex items-center gap-2">
          <History size={18} className="text-red-600" />
          <h3 className="text-base font-black text-foreground">Histórico de Metas Alcançadas (Meses Anteriores)</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {history.map((item, idx) => (
            <div key={idx} className="bg-muted/50 border border-border p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar size={13} /> {item.period}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-black">{item.completedGoals}/{item.totalGoals}</span>
              </div>
              <p className="text-sm font-bold text-foreground">{item.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
