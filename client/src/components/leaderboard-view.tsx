import React, { useState } from "react";
import { Trophy, Flame, Award, Sparkles, Filter, Crown, Calendar } from "lucide-react";

interface LeaderboardUser {
  rank: number;
  name: string;
  xp: number;
  streak: number;
  level: string;
  badgesCount: number;
  turma: string;
  period: "weekly" | "monthly" | "all";
}

const leaderboardData: LeaderboardUser[] = [
  { rank: 1, name: "Maria Clara Santos", xp: 450, streak: 21, level: "Advanced (C1)", badgesCount: 12, turma: "Turma A - Manhã", period: "weekly" },
  { rank: 2, name: "Anderson Palafoz (Demo)", xp: 390, streak: 14, level: "Expert (C2)", badgesCount: 10, turma: "Turma Especial", period: "weekly" },
  { rank: 3, name: "João Pedro Alves", xp: 350, streak: 12, level: "Upper-Intermediate (B2)", badgesCount: 9, turma: "Turma B - Noite", period: "weekly" },
  { rank: 4, name: "Ana Beatriz Souza", xp: 310, streak: 9, level: "Intermediate (B1)", badgesCount: 8, turma: "Turma A - Manhã", period: "weekly" },
  
  { rank: 1, name: "Anderson Palafoz (Demo)", xp: 1250, streak: 14, level: "Expert (C2)", badgesCount: 10, turma: "Turma Especial", period: "monthly" },
  { rank: 2, name: "Maria Clara Santos", xp: 1180, streak: 21, level: "Advanced (C1)", badgesCount: 12, turma: "Turma A - Manhã", period: "monthly" },
  { rank: 3, name: "João Pedro Alves", xp: 1050, streak: 12, level: "Upper-Intermediate (B2)", badgesCount: 9, turma: "Turma B - Noite", period: "monthly" },
  
  { rank: 1, name: "Maria Clara Santos", xp: 4250, streak: 21, level: "Advanced (C1)", badgesCount: 12, turma: "Turma A - Manhã", period: "all" },
  { rank: 2, name: "Anderson Palafoz (Demo)", xp: 3950, streak: 14, level: "Expert (C2)", badgesCount: 10, turma: "Turma Especial", period: "all" },
  { rank: 3, name: "João Pedro Alves", xp: 3500, streak: 12, level: "Upper-Intermediate (B2)", badgesCount: 9, turma: "Turma B - Noite", period: "all" },
  { rank: 4, name: "Ana Beatriz Souza", xp: 3100, streak: 9, level: "Intermediate (B1)", badgesCount: 8, turma: "Turma A - Manhã", period: "all" },
  { rank: 5, name: "Lucas Gabriel Lima", xp: 2800, streak: 7, level: "Intermediate (B1)", badgesCount: 7, turma: "Turma B - Noite", period: "all" },
];

export function LeaderboardView() {
  const [filterTurma, setFilterTurma] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState<"weekly" | "monthly" | "all">("weekly");

  const filtered = leaderboardData.filter((user) => {
    if (user.period !== filterPeriod) return false;
    if (filterTurma !== "all" && !user.turma.includes(filterTurma)) return false;
    return true;
  });

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

        <div className="flex flex-wrap items-center gap-2 bg-white/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/10">
          <button
            onClick={() => setFilterPeriod("weekly")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${filterPeriod === "weekly" ? "bg-red-600 text-white shadow" : "text-slate-300 hover:text-white"}`}
          >
            Semanal
          </button>
          <button
            onClick={() => setFilterPeriod("monthly")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${filterPeriod === "monthly" ? "bg-red-600 text-white shadow" : "text-slate-300 hover:text-white"}`}
          >
            Mensal
          </button>
          <button
            onClick={() => setFilterPeriod("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${filterPeriod === "all" ? "bg-red-600 text-white shadow" : "text-slate-300 hover:text-white"}`}
          >
            Geral
          </button>

          <div className="flex items-center gap-1 border-l border-white/20 pl-2 ml-1">
            <Filter size={14} className="text-red-400" />
            <select
              value={filterTurma}
              onChange={(e) => setFilterTurma(e.target.value)}
              className="bg-transparent text-white text-xs font-bold px-1 py-1 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">Todas</option>
              <option value="Manhã" className="bg-slate-900 text-white">Manhã</option>
              <option value="Noite" className="bg-slate-900 text-white">Noite</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="text-amber-500" size={18} /> Top Alunos ({filterPeriod === "weekly" ? "Esta Semana" : filterPeriod === "monthly" ? "Este Mês" : "Geral"})
          </h3>
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
            <Calendar size={13} /> {filtered.length} alunos classificados
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.map((user, idx) => {
            const rankNum = idx + 1;
            const isTop1 = rankNum === 1;
            return (
              <div
                key={user.name}
                className={`p-4 sm:p-5 flex items-center justify-between transition hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                  isTop1 ? "bg-amber-50/60 dark:bg-amber-950/20" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-2xl font-black text-xs flex items-center justify-center shadow-sm ${
                    rankNum === 1
                      ? "bg-amber-500 text-slate-950 shadow-amber-500/30"
                      : rankNum === 2
                      ? "bg-slate-300 text-slate-900"
                      : rankNum === 3
                      ? "bg-amber-700 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}>
                    {rankNum === 1 ? <Crown size={18} /> : `#${rankNum}`}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      {user.name} {isTop1 && <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">Líder</span>}
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
