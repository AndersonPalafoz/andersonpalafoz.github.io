import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight, X, BookOpen, Mic, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

const onboardingSteps = [
  {
    title: "Bem-vindo(a) ao seu Painel Acadêmico!",
    description: "Aqui você acompanha seus cursos ativos, porcentagens de conclusão, notas e frequência em tempo real.",
    icon: Sparkles,
  },
  {
    title: "Trilha Adaptativa por IA",
    description: "Nossa inteligência artificial analisa suas lacunas de gramática e speaking para sugerir focos de estudo sob medida.",
    icon: BookOpen,
  },
  {
    title: "Prática de Speaking com IA",
    description: "Grave áudios diretamente no navegador e receba feedback imediato sobre sua pronúncia com ondas sonoras animadas.",
    icon: Mic,
  },
  {
    title: "Ofensiva (Streak) & Placar de Líderes",
    description: "Mantenha sua chama acesa estudando diariamente e compare seu XP com os colegas no leaderboard.",
    icon: Trophy,
  },
];

export function StudentDashboardOnboarding() {
  const [show, setShow] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const dismissed = localStorage.getItem("ap_onboarding_dismissed");
    if (!dismissed) {
      setShow(true);
    }
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem("ap_onboarding_dismissed", "true");
  };

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleDismiss();
    }
  };

  if (!show) return null;

  const step = onboardingSteps[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative space-y-6">
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          aria-label="Fechar tour"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 shadow-sm">
            <Icon size={28} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400">
              Passo {currentStep + 1} de {onboardingSteps.length}
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{step.title}</h3>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {step.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleDismiss}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 transition"
          >
            Pular Tour
          </button>
          <Button
            onClick={handleNext}
            className="bg-red-600 hover:bg-red-700 text-white font-black text-xs h-11 px-6 rounded-2xl shadow-md gap-2"
          >
            {currentStep === onboardingSteps.length - 1 ? "Começar a Explorar" : "Próximo Passo"} <ArrowRight size={15} />
          </Button>
        </div>
      </div>
    </div>
  );
}
