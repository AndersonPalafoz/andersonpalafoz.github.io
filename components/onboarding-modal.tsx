'use client';

import { useState, useEffect } from "react";
import { Sparkles, BookOpen, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const completed = localStorage.getItem("ap_onboarding_completed");
    if (!completed) {
      setIsOpen(true);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem("ap_onboarding_completed", "true");
    setIsOpen(false);
    toast.success("Onboarding concluído! Bem-vindo(a) à plataforma Anderson Palafoz.");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Bem-vindo(a) ao Início</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Passo {step} de 3</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleComplete}
            className="text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
          >
            Pular
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-4 text-center py-2">
            <div className="w-16 h-16 rounded-3xl bg-red-50 dark:bg-red-950/40 text-red-600 mx-auto flex items-center justify-center">
              <ShieldCheck size={32} />
            </div>
            <h4 className="text-xl font-black text-slate-900 dark:text-white">Conectado com Segurança</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
              Sua conta está integrada com Google Workspace e protegida por padrões avançados de segurança. Suas credenciais permanecem isoladas e sob seu controle.
            </p>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3.5 rounded-2xl text-xs transition shadow-md flex items-center justify-center gap-2 mt-4"
            >
              Continuar <ArrowRight size={16} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 text-center py-2">
            <div className="w-16 h-16 rounded-3xl bg-red-50 dark:bg-red-950/40 text-red-600 mx-auto flex items-center justify-center">
              <BookOpen size={32} />
            </div>
            <h4 className="text-xl font-black text-slate-900 dark:text-white">Explore o Catálogo de Cursos</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
              Como sua conta começa limpa e sem progresso pré-estabelecido, você tem total liberdade para escolher a trilha de inglês que melhor se adapta ao seu nível.
            </p>
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3.5 rounded-2xl text-xs transition"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-1/2 bg-red-600 hover:bg-red-700 text-white font-black py-3.5 rounded-2xl text-xs transition shadow-md flex items-center justify-center gap-2"
              >
                Próximo <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-center py-2">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 size={32} />
            </div>
            <h4 className="text-xl font-black text-slate-900 dark:text-white">Tudo Pronto para Começar!</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
              Você pode importar dados do Google Classroom a qualquer momento ou iniciar diretamente sua primeira matrícula no catálogo de cursos.
            </p>
            <div className="flex flex-col gap-2.5 mt-4">
              <Link
                href="/aulas"
                onClick={handleComplete}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3.5 rounded-2xl text-xs transition shadow-md flex items-center justify-center gap-2"
              >
                Escolher Meu Primeiro Curso <ArrowRight size={16} />
              </Link>
              <button
                type="button"
                onClick={handleComplete}
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-2xl text-xs transition"
              >
                Ir para o Painel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
