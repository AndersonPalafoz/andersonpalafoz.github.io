'use client';

import { useState, useEffect } from "react";
import { Trophy, Award, Star, ShieldCheck, Flame, BookOpen, Lock } from "lucide-react";

export function ProfileMedalsGallery() {
  const [completedCount, setCompletedCount] = useState(3);
  const [traditionalMode, setTraditionalMode] = useState(false);

  useEffect(() => {
    const storedLessons = localStorage.getItem("ap_weekly_completed_lessons");
    if (storedLessons) {
      const parsed = parseInt(storedLessons, 10);
      if (!isNaN(parsed)) setCompletedCount(parsed);
    }
    const storedMode = localStorage.getItem("ap_traditional_mode");
    if (storedMode === "true") {
      setTraditionalMode(true);
    }
  }, []);

  const medals = [
    {
      id: "first_step",
      title: "Primeiro Passo",
      category: "Jornada Acadêmica",
      description: "Concluiu sua primeira aula na plataforma.",
      unlocked: completedCount >= 1,
      icon: Star,
      date: "Conquistado nesta semana",
      color: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300",
    },
    {
      id: "rhythm",
      title: "Ritmo Constante",
      category: "Consistência",
      description: "Completou 3 ou mais aulas no período semanal.",
      unlocked: completedCount >= 3,
      icon: Trophy,
      date: "Conquistado nesta semana",
      color: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-300",
    },
    {
      id: "dedication",
      title: "Dedicação Exemplar",
      category: "Desempenho",
      description: "Atingiu a meta completa de 5+ aulas concluídas.",
      unlocked: completedCount >= 5,
      icon: Award,
      date: "Pendente para desbloqueio",
      color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300",
    },
    {
      id: "classroom_sync",
      title: "Google Classroom Conectado",
      category: "Integração",
      description: "Sincronizou turmas e atividades reais do Google Sala de Aula.",
      unlocked: true,
      icon: ShieldCheck,
      date: "Vinculado com sucesso",
      color: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300",
    },
    {
      id: "streak_7",
      title: "Ofensiva de 7 Dias",
      category: "Hábito de Estudo",
      description: "Manteve acesso consecutivo por 7 dias na plataforma.",
      unlocked: true,
      icon: Flame,
      date: "Meta atingida",
      color: "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-300",
    },
    {
      id: "master_grammar",
      title: "Mestre da Gramática",
      category: "Materiais",
      description: "Baixou e estudou todos os guias de gramática A1-C2.",
      unlocked: false,
      icon: BookOpen,
      date: "Em andamento",
      color: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300",
    },
  ];

  if (traditionalMode) {
    return (
      <div className="surface-card p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="eyebrow">Modo Tradicional Ativo</span>
            <h3 className="text-xl font-black text-foreground">Registro Acadêmico Oficial</h3>
          </div>
          <span className="text-xs font-bold text-muted-foreground bg-muted px-3 py-1.5 rounded-xl">Acadêmico</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          No Modo Tradicional, a galeria de medalhas e elementos de gamificação encontram-se ocultos, priorizando o histórico objetivo de notas, frequência e boletim escolar.
        </p>
      </div>
    );
  }

  const unlockedCount = medals.filter(m => m.unlocked).length;

  return (
    <div className="surface-card p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-5">
        <div className="space-y-1">
          <span className="eyebrow inline-flex items-center gap-1.5 text-red-600">
            <Trophy size={15} /> Galeria de Conquistas
          </span>
          <h2 className="text-xl font-black text-foreground">Medalhas e Emblemas Acumulados</h2>
          <p className="text-xs text-muted-foreground">Visualize todas as conquistas obtidas ao longo da sua jornada de aprendizado.</p>
        </div>
        <div className="bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 px-4 py-2 rounded-2xl border border-red-200/60 text-xs font-black flex items-center gap-2">
          <Award size={16} /> <span>{unlockedCount} de {medals.length} Desbloqueadas</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {medals.map((medal) => {
          const IconComp = medal.icon;
          return (
            <div
              key={medal.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between gap-4 ${
                medal.unlocked
                  ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs hover:border-red-300 dark:hover:border-red-800"
                  : "bg-slate-50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-60 grayscale"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${medal.color}`}>
                  <IconComp size={24} />
                </div>
                {medal.unlocked ? (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-900">
                    Conquistada
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Lock size={12} /> Bloqueada
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400">{medal.category}</span>
                <h3 className="text-base font-black text-foreground">{medal.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{medal.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 flex items-center justify-between">
                <span>{medal.date}</span>
                {medal.unlocked && <span className="text-primary font-black">✦ Oficial</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
