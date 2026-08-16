import React from "react";
import { Lock, Sparkles, X, ArrowRight, ShieldCheck } from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function UpgradeModal({
  isOpen,
  onClose,
  title = "Conteúdo Exclusivo e Pago",
  description = "Este material ou curso faz parte do ecossistema avançado do professor Anderson Palafoz. Para baixar e acessar todo o conteúdo C1/C2 sem restrições, faça o upgrade ou adquira o acesso completo."
}: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative space-y-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 rounded-xl transition-colors"
        >
          <X size={20} />
        </button>

        <div className="h-14 w-14 rounded-2xl bg-red-600/10 dark:bg-red-600/20 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-500/30">
          <Lock size={28} />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 bg-red-500/10 px-3 py-1 rounded-full">
            <Sparkles size={12} /> Acesso Restrito
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{title}</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{description}</p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <ShieldCheck size={16} className="text-emerald-500" /> O que você ganha com o Upgrade:
          </div>
          <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 pl-5 list-disc">
            <li>Download ilimitado de Worksheets e Slides C1/C2</li>
            <li>Correção de pronúncia ilimitada com IA</li>
            <li>Certificados oficiais com QR Code público</li>
          </ul>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-xl text-xs font-bold transition-colors"
          >
            Voltar
          </button>
          <a
            href="/dashboard"
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-600/25 flex items-center justify-center gap-1.5 text-center"
          >
            <span>Fazer Upgrade</span>
            <ArrowRight size={15} />
          </a>
        </div>
      </div>
    </div>
  );
}
