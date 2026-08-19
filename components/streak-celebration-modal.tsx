"use client";

import { useEffect, useState } from "react";
import { Flame, Sparkles, X } from "lucide-react";

type GamificationSnapshot = {
  streakDays: number;
  isNewRecord: boolean;
};

export function StreakCelebrationModal() {
  const [snapshot, setSnapshot] = useState<GamificationSnapshot | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/gamification", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json() as GamificationSnapshot;
        const streakDays = Number(data.streakDays) || 0;
        const lastCelebrated = Number(sessionStorage.getItem("ap_streak_celebrated_days") || "0");
        if (data.isNewRecord && streakDays > 0 && streakDays > lastCelebrated) {
          setSnapshot({ streakDays, isNewRecord: true });
          setShow(true);
          sessionStorage.setItem("ap_streak_celebrated_days", String(streakDays));
        }
      } catch {
        // A celebração é opcional; falhas de gamificação não bloqueiam o dashboard.
      }
    };

    void load();
  }, []);

  if (!show || !snapshot) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in" role="dialog" aria-modal="true" aria-labelledby="streak-celebration-title">
      <div className="relative w-full max-w-md space-y-6 rounded-3xl border border-red-500/30 bg-white p-8 text-center shadow-2xl dark:bg-slate-900 animate-in zoom-in-95">
        <button
          type="button"
          onClick={() => setShow(false)}
          aria-label="Fechar celebração da ofensiva"
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 dark:hover:bg-slate-800"
        >
          <X size={18} aria-hidden="true" />
        </button>

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-red-600 text-white shadow-lg shadow-red-600/30 animate-bounce">
          <Flame size={40} className="fill-white" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-black uppercase tracking-wider text-red-700 dark:bg-red-950/60 dark:text-red-300">
            <Sparkles size={14} aria-hidden="true" /> Novo recorde confirmado
          </div>
          <h2 id="streak-celebration-title" className="text-2xl font-black text-gray-950 dark:text-white">Ofensiva de {snapshot.streakDays} dias</h2>
          <p className="px-4 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
            Esta ofensiva foi calculada a partir de conclusões reais de aulas ou atividades registradas na plataforma.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShow(false)}
          className="w-full rounded-2xl bg-red-600 py-3.5 text-xs font-black text-white shadow-lg shadow-red-600/25 transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
        >
          Continuar estudando
        </button>
      </div>
    </div>
  );
}
