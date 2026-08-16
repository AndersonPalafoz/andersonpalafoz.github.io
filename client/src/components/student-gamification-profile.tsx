import React, { useState } from "react";
import { Flame, Award, Zap, TrendingUp, ShieldCheck, CheckCircle2, Gift, Mic, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  date?: string;
  requirement: string;
}

interface Mission {
  id: string;
  title: string;
  reward: number;
  completed: boolean;
  type: "standard" | "speaking";
}

const mockBadges: Badge[] = [
  { id: "1", title: "Grammar Master", description: "Completou 5 quizzes de gramática com 100% de aproveitamento", icon: "⭐", unlocked: true, date: "15 Ago 2026", requirement: "Acertar 5 quizzes consecutivos sem errar." },
  { id: "2", title: "Speaking Pro", description: "Enviou 10 áudios de speaking avaliados pela inteligência artificial", icon: "🎙️", unlocked: true, date: "14 Ago 2026", requirement: "Enviar 10 gravações de áudio no assistente de IA." },
  { id: "3", title: "Streak Master", description: "Meteu 14 dias seguidos de ofensiva sem falhar", icon: "🔥", unlocked: true, date: "Hoje", requirement: "Acessar a plataforma por 14 dias consecutivos." },
  { id: "4", title: "Vocabulary Hero", description: "Dominou 100 palavras novas no hub acadêmico", icon: "⚡", unlocked: false, requirement: "Estudar e marcar 100 palavras no glossário." },
];

export function StudentGamificationProfile() {
  const [totalXp, setTotalXp] = useState(1250);
  const currentStreak = 14;
  const rankPosition = 2;
  const [celebrating, setCelebrating] = useState(false);
  const [celebrationMsg, setCelebrationMsg] = useState("");

  const [missions, setMissions] = useState<Mission[]>([
    { id: "m1", title: "Completar o Quiz diário de B1", reward: 50, completed: false, type: "standard" },
    { id: "m2", title: "Gravar desafio de Speaking com IA", reward: 100, completed: false, type: "speaking" },
    { id: "m3", title: "Marcar 1 material como concluído na biblioteca", reward: 40, completed: true, type: "standard" },
  ]);

  const triggerCelebration = (msg: string) => {
    setCelebrationMsg(msg);
    setCelebrating(true);
    setTimeout(() => {
      setCelebrating(false);
    }, 3000);
  };

  const completeMission = (id: string, reward: number, title: string) => {
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id === id && !m.completed) {
          const newTotal = totalXp + reward;
          setTotalXp(newTotal);
          toast.success(`Missão concluída! +${reward} XP adicionados.`);
          triggerCelebration(`Parabéns! +${reward} XP por "${title}"!`);
          return { ...m, completed: true };
        }
        return m;
      })
    );
  };

  return (
    <div className="space-y-6 relative">
      {/* Banner de Celebração Animada */}
      {celebrating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-gradient-to-tr from-red-600 to-rose-600 text-white p-8 rounded-3xl shadow-2xl text-center space-y-4 max-w-md w-full mx-4 border border-white/20 animate-in zoom-in-95">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-white shadow-inner mx-auto">
              <Sparkles size={32} className="animate-spin" />
            </div>
            <h3 className="text-2xl font-black">Meta Atingida! 🚀</h3>
            <p className="text-sm font-bold text-red-100">{celebrationMsg}</p>
            <button
              onClick={() => setCelebrating(false)}
              className="bg-white text-red-600 font-black px-6 py-2.5 rounded-xl shadow-md hover:bg-slate-100 transition text-xs uppercase tracking-wider"
            >
              Continuar Estudando
            </button>
          </div>
        </div>
      )}

      {/* Banner Urbano & Acadêmico com Gradiente Coeso */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 p-6 sm:p-8 text-white shadow-2xl border border-slate-800">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 p-1 shadow-xl flex items-center justify-center font-black text-2xl text-white">
                AP
              </div>
              <span className="absolute -bottom-2 -right-2 bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                <Flame size={11} className="fill-slate-950" /> {currentStreak}d
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                  Nível 5 • Expert (C2)
                </span>
                <span className="text-xs font-bold text-slate-400">Rank #{rankPosition} na Turma</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mt-1 text-white">Painel de Conquistas & XP</h2>
              <p className="text-xs text-slate-300 mt-1">Sua jornada de alta performance com foco e consistência.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
            <div className="text-center px-3 border-r border-white/10">
              <span className="block text-2xl font-black text-amber-400">{totalXp}</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">XP Total</span>
            </div>
            <div className="text-center px-3">
              <span className="block text-2xl font-black text-red-500">{currentStreak}</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Dias de Ofensiva</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Seções */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Medalhas & Badges com Tooltips Explicativos no Hover */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="text-red-600" size={20} /> Medalhas & Badges Conquistadas
            </h3>
            <span className="text-xs font-bold text-slate-500">Passe o mouse para ver os detalhes</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mockBadges.map((badge) => (
              <div
                key={badge.id}
                className={`group relative p-4 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex items-start gap-3.5 ${
                  badge.unlocked
                    ? "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 shadow-sm"
                    : "bg-slate-50/40 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-800 opacity-60"
                }`}
              >
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-110 ${badge.unlocked ? "bg-red-100 dark:bg-red-950/60 shadow-inner" : "bg-slate-200 dark:bg-slate-800"}`}>
                  {badge.icon}
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{badge.title}</h4>
                    {badge.unlocked && <ShieldCheck size={15} className="text-emerald-600 shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{badge.description}</p>
                  {badge.date && <span className="inline-block text-[10px] font-bold text-slate-400 mt-1">Conquistado em {badge.date}</span>}
                </div>

                {/* Tooltip Explicativo no Hover */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-12 z-20 hidden group-hover:flex flex-col items-center pointer-events-none animate-in fade-in zoom-in-95">
                  <div className="bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-xl whitespace-nowrap border border-slate-700">
                    Requisito: {badge.requirement}
                  </div>
                  <div className="w-2 h-2 bg-slate-950 rotate-45 -mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Missões Diárias com XP Bônus & Desempenho */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Gift className="text-red-600" size={20} /> Missões Diárias (XP Bônus)
            </h3>
            <div className="space-y-3">
              {missions.map((m) => (
                <div key={m.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="font-extrabold text-xs text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                      {m.type === "speaking" && <Mic size={13} className="text-red-600 shrink-0" />}
                      {m.title}
                    </p>
                    <span className="text-[10px] font-black text-amber-600 dark:text-amber-400">+{m.reward} XP</span>
                  </div>
                  {m.completed ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl">
                      <CheckCircle2 size={14} /> Concluída
                    </span>
                  ) : (
                    <button
                      onClick={() => completeMission(m.id, m.reward, m.title)}
                      className="bg-red-600 hover:bg-red-700 text-white font-black text-xs px-3.5 py-1.5 rounded-xl shadow-sm transition shrink-0"
                    >
                      Resgatar
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="text-red-600" size={20} /> Desempenho Acadêmico
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600 dark:text-slate-300">Precisão nos Quizzes</span>
                  <span className="text-red-600 font-black">94%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-red-600 rounded-full" style={{ width: "94%" }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600 dark:text-slate-300">Aulas Concluídas</span>
                  <span className="text-emerald-600 font-black">28 / 32</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: "87%" }} />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 text-xs text-slate-700 dark:text-slate-300 space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-red-600 dark:text-red-400">
                <Zap size={15} /> Dica de Consistência
              </p>
              <p className="leading-relaxed">Mantenha sua ofensiva diária respondendo ao quiz de gramática ou gravando um speaking hoje mesmo.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
