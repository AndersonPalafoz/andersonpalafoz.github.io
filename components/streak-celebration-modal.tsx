"use client";

import { useEffect, useState } from "react";
import { Flame, Sparkles, Trophy, X } from "lucide-react";

export function StreakCelebrationModal() {
  const [show, setShow] = useState(false);
  const [streakDays] = useState(14);

  useEffect(() => {
    // Verificar se já celebrou o marco atual nesta sessão
    const lastCelebrated = sessionStorage.getItem("ap_streak_celebrated");
    if (!lastCelebrated) {
      const timer = setTimeout(() => {
        setShow(true);
        sessionStorage.setItem("ap_streak_celebrated", "true");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl border border-red-500/30 bg-white dark:bg-slate-900 p-8 text-center shadow-2xl space-y-6 animate-in zoom-in-95">
        <button
          type="button"
          onClick={() => setShow(false)}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
        >
          <X size={18} />
        </button>

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-red-600 text-white shadow-lg shadow-red-600/30 animate-bounce">
          <Flame size={40} className="fill-white" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs font-black uppercase tracking-wider">
            <Sparkles size={14} /> Novo Recorde Conquistado!
          </div>
          <h2 className="text-2xl font-black text-gray-950 dark:text-white">Ofensiva de {streakDays} Dias!</h2>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed px-4">
            Parabéns pela dedicação exemplar aos estudos diários de inglês. Sua consistência está transformando seu aprendizado!
          </p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-4 rounded-2xl flex items-center justify-center gap-3 text-amber-800 dark:text-amber-300 text-xs font-bold">
          <Trophy size={18} className="text-amber-600 shrink-0" />
          <span>+150 XP de Bônus adicionados ao seu perfil</span>
        </div>

        <button
          type="button"
          onClick={() => setShow(false)}
          className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-lg shadow-red-600/25 transition"
        >
          Continuar Estudando 🚀
        </button>
      </div>
    </div>
  );
}
