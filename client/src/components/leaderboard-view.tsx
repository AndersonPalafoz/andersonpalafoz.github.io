import React, { useState } from "react";
import { Trophy, Flame, Award, Sparkles, Filter, Crown } from "lucide-react";

interface LeaderboardUser {
  rank: number;
  name: string;
  xp: number;
  streak: number;
  level: string;
  badgesCount: number;
  turma: string;
}

const leaderboardData: LeaderboardUser[] = [
  { rank: 1, name: "Maria Clara Santos", xp: 1450, streak: 21, level: "Advanced (C1)", badgesCount: 12, turma: "Turma A - Manhã" },
  { rank: 2, name: "Anderson Palafoz (Demo)", xp: 1250, streak: 14, level: "Expert (C2)", badgesCount: 10, turma: "Turma Especial" },
  { rank: 3, name: "João Pedro Alves", xp: 1180, streak: 12, level: "Upper-Intermediate (B2)", badgesCount: 9, turma: "Turma B - Noite" },
  { rank: 4, name: "Ana Beatriz Souza", xp: 1020, streak: 9, level: "Intermediate (B1)", badgesCount: 8, turma: "Turma A - Manhã" },
  { rank: 5, name: "Lucas Gabriel Lima", xp: 950, streak: 7, level: "Intermediate (B1)", badgesCount: 7, turma: "Turma B - Noite" },
  { rank: 6, name: "Beatriz Oliveira", xp: 890, streak: 5, level: "Elementary (A2)", badgesCount: 6, turma: "Turma A - Manhã" },
];

export function LeaderboardView() {
  const [filterTurma, setFilterTurma] = useState("all");

  const filtered = leaderboardData.filter(user => filterTurma === "all" || user.turma.includes(filterTurma));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 p-6 sm:p-8 rounded-3xl text-white shadow-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} /> Placar Global de Líderes
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mt-1">Ranking das Turmas de Inglês</h2>
          <p className="text-xs text-slate-300 mt-1">Compare seu XP, ofensivas diárias e evolução com seus colegas em tempo real.</p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/10">
          <Filter size={15} className="text-red-400 ml-2" />
          <select
            value={filterTurma}
            onChange={(e) => setFilterTurma(e.target.value)}
            className="bg-transparent text-white text-xs font-bold px-2 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-white">Todas as Turmas</option>
            <option value="Manhã" className="bg-slate-900 text-white">Turma Manhã</option>
            <option value="Noite" className="bg-slate-900 text-white">Turma Noite</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="text-amber-500" size={18} /> Top Alunos em Destaque
          </h3>
          <span className="text-xs font-bold text-slate-400">{filtered.length} alunos classificados</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.map((user) => {
            const isTop1 = user.rank === 1;
            return (
              <div
                key={user.rank}
                className={`p-4 sm:p-5 flex items-center justify-between transition hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                  isTop1 ? "bg-amber-50/60 dark:bg-amber-950/20" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-2xl font-black text-xs flex items-center justify-center shadow-sm ${
                    user.rank === 1
                      ? "bg-amber-500 text-slate-950 shadow-amber-500/30"
                      : user.rank === 2
                      ? "bg-slate-300 text-slate-900"
                      : user.rank === 3
                      ? "bg-amber-700 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}>
                    {user.rank === 1 ? <Crown size={18} /> : `#${user.rank}`}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      {user.name} {isTop1 && <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">Líder Geral</span>}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{user.level} • {user.turma}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-8">
                  <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-900/40">
                    <Flame size={14} /> {user.streak} dias
                  </div>
                  <div className="hidden md:flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                    <Award size={14} className="text-red-600" /> {user.badgesCount} badges
                  </div>
                  <div className="text-right">
                    <span className="font-black text-sm sm:text-base text-red-600 dark:text-red-400">{user.xp} XP</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
