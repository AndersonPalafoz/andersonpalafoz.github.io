import React, { useState } from "react";
import { Award, Flame, Trophy, Star, CheckCircle2 } from "lucide-react";

interface BadgeItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  date?: string;
  xpBonus: number;
}

export function InteractiveBadges() {
  const [badges] = useState<BadgeItem[]>([
    {
      id: "1",
      title: "Streak Mestre 7 Dias",
      description: "Conquistado por manter a ofensiva diária de estudos por 7 dias consecutivos.",
      icon: "Flame",
      earned: true,
      date: "14/08/2026",
      xpBonus: 150
    },
    {
      id: "2",
      title: "Pronúncia Impecável",
      description: "Obtido ao alcançar nota acima de 95% na avaliação de Speaking com IA.",
      icon: "Award",
      earned: true,
      date: "12/08/2026",
      xpBonus: 200
    },
    {
      id: "3",
      title: "Explorador de Vocabulário",
      description: "Concluído ao interagir com mais de 50 materiais da biblioteca C1/C2.",
      icon: "Star",
      earned: true,
      date: "10/08/2026",
      xpBonus: 100
    },
    {
      id: "4",
      title: "Lenda do Leaderboard",
      description: "Alcançar o Top 3 do ranking geral semanal da turma.",
      icon: "Trophy",
      earned: false,
      xpBonus: 500
    }
  ]);

  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Trophy size={18} className="text-amber-500" /> Medalhas & Conquistas
        </h3>
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
          {badges.filter(b => b.earned).length} / {badges.length} Desbloqueadas
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {badges.map((badge) => (
          <div
            key={badge.id}
            onMouseEnter={() => setActiveTooltip(badge.id)}
            onMouseLeave={() => setActiveTooltip(null)}
            className={`relative rounded-2xl p-5 border transition-all duration-300 flex flex-col items-center text-center gap-3 group cursor-pointer ${
              badge.earned
                ? "bg-gradient-to-br from-amber-500/10 via-slate-900/40 to-red-600/10 border-amber-500/30 shadow-lg shadow-amber-500/5 hover:scale-[1.02]"
                : "bg-slate-800/20 border-slate-700/40 opacity-60 hover:opacity-90"
            }`}
          >
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6 ${
              badge.earned ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-md" : "bg-slate-800 text-slate-500"
            }`}>
              {badge.icon === "Flame" && <Flame size={28} className="text-amber-500" />}
              {badge.icon === "Award" && <Award size={28} className="text-red-500" />}
              {badge.icon === "Star" && <Star size={28} className="text-yellow-400" />}
              {badge.icon === "Trophy" && <Trophy size={28} className="text-purple-400" />}
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-black text-slate-900 dark:text-white">{badge.title}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{badge.description}</p>
            </div>

            <div className="mt-auto pt-2 border-t border-slate-200 dark:border-slate-800/80 w-full flex items-center justify-between text-[10px]">
              <span className="font-bold text-red-500">+{badge.xpBonus} XP</span>
              {badge.earned ? (
                <span className="text-emerald-500 flex items-center gap-1 font-bold">
                  <CheckCircle2 size={12} /> {badge.date}
                </span>
              ) : (
                <span className="text-slate-400 font-bold">Bloqueada</span>
              )}
            </div>

            {activeTooltip === badge.id && (
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] font-medium py-2 px-3 rounded-xl shadow-2xl border border-slate-700 z-30 w-56 text-center animate-in fade-in zoom-in-95 pointer-events-none">
                <p className="font-bold text-amber-400 mb-0.5">{badge.title}</p>
                {badge.description}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-slate-900 border-r border-b border-slate-700" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
