"use client";

import { useState, useEffect } from "react";
import { Trophy, Flame, Users, Award, Loader2 } from "lucide-react";

interface LeaderboardUser {
  rank: number;
  name: string;
  totalXp: number;
  streakDays: number;
  medalsCount: number;
}

export function ClassLeaderboard() {
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setLeaderboard(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="surface-card p-8 flex items-center justify-center min-h-[250px]">
        <Loader2 className="animate-spin text-red-600" size={32} />
      </div>
    );
  }

  return (
    <div className="surface-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="eyebrow mb-2">
            <Trophy size={16} />
            Placar de Líderes (Leaderboard)
          </div>
          <h3 className="text-xl font-black text-foreground">Ranking de XP e Ofensivas</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Compare seu desempenho, ofensiva e quantidade de medalhas com os colegas da plataforma.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-2xl px-4 py-2.5 text-xs font-bold text-red-700 dark:text-red-300">
          <Users size={16} /> Alunos Ativos
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border text-[11px] font-black uppercase text-muted-foreground">
              <th className="py-3 px-4">Posição</th>
              <th className="py-3 px-4">Estudante</th>
              <th className="py-3 px-4 text-center">Ofensiva (Streak)</th>
              <th className="py-3 px-4 text-center">Medalhas</th>
              <th className="py-3 px-4 text-right">XP Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs">
            {leaderboard.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-foreground">
                  Nenhum registro no ranking encontrado.
                </td>
              </tr>
            ) : (
              leaderboard.map((item) => (
                <tr key={item.rank} className="hover:bg-muted/50 transition">
                  <td className="py-3.5 px-4 font-black">
                    {item.rank === 1 ? (
                      <span className="inline-flex items-center justify-center h-7 w-7 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 font-black shadow-xs">
                        1º
                      </span>
                    ) : item.rank === 2 ? (
                      <span className="inline-flex items-center justify-center h-7 w-7 rounded-xl bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-black">
                        2º
                      </span>
                    ) : item.rank === 3 ? (
                      <span className="inline-flex items-center justify-center h-7 w-7 rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400 font-black">
                        3º
                      </span>
                    ) : (
                      <span className="text-muted-foreground font-bold px-2">{item.rank}º</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-foreground">
                    {item.name || "Aluno(a)"}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full text-[11px]">
                      <Flame size={13} /> {item.streakDays} dias
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 font-bold text-red-600 dark:text-red-400">
                      <Award size={14} /> {item.medalsCount}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-foreground">
                    {item.totalXp} XP
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
