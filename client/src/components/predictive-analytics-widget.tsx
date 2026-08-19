import { useState, useEffect } from "react";
import { TrendingUp, Zap, Target, ShieldCheck, Sparkles, Lightbulb, Flame } from "lucide-react";

export function PredictiveAnalyticsWidget() {
  const [streakDays, setStreakDays] = useState(1);

  useEffect(() => {
    fetch("/api/gamification")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && typeof data.streakDays === "number") {
          setStreakDays(data.streakDays);
        }
      })
      .catch((err) => console.error("Erro ao buscar streak:", err));
  }, []);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-red-950 text-white border border-red-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-red-600/20 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
            <TrendingUp size={20} />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-red-400">
              <Sparkles size={12} /> Inteligência Preditiva & IA
            </div>
            <h3 className="text-lg font-black text-white">Previsão de Desempenho & Ritmo</h3>
          </div>
        </div>
        <span className="text-xs font-black bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-1 rounded-full self-start sm:self-auto flex items-center gap-1.5">
          <Flame size={14} className="text-amber-400" /> Ofensiva Real: {streakDays} Dias
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>Sequência de Ofensiva</span>
            <Flame size={16} className="text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">{streakDays} Dias</p>
          <p className="text-[11px] text-slate-400">Dias consecutivos de acesso e estudos.</p>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>Risco de Streak</span>
            <Zap size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">Baixo (0%)</p>
          <p className="text-[11px] text-slate-400">Sua ofensiva diária está protegida hoje.</p>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>Previsão de Conclusão</span>
            <Target size={16} className="text-red-400" />
          </div>
          <p className="text-2xl font-black text-white">14 Dias</p>
          <p className="text-[11px] text-slate-400">Mantendo sua média atual de 4 aulas/semana.</p>
        </div>
      </div>
    </div>
  );
}
