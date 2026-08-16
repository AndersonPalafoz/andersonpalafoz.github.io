import React, { useState } from "react";
import { Lock, Sparkles, X, ArrowRight, Check, XCircle, CreditCard, Loader2 } from "lucide-react";

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
  description = "Este material ou curso faz parte do ecossistema acadêmico avançado do professor Anderson Palafoz. Compare os planos abaixo e desbloqueie o acesso completo."
}: UpgradeModalProps) {
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  if (!isOpen) return null;

  const handleDirectCheckout = async () => {
    setLoadingCheckout(true);
    try {
      // Simulação de criação de sessão Stripe Checkout segura
      await new Promise((res) => setTimeout(res, 1200));
      window.location.href = "/dashboard?success=checkout_pro";
    } catch (err) {
      console.error(err);
      setLoadingCheckout(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 rounded-xl transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-red-600/10 dark:bg-red-600/20 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-500/30 shrink-0">
            <Lock size={28} />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 bg-red-500/10 px-3 py-1 rounded-full mb-1">
              <Sparkles size={12} /> Acesso Restrito
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">{title}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">{description}</p>
          </div>
        </div>

        {/* Tabela Comparativa de Benefícios */}
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5 font-bold">Recursos e Benefícios</th>
                <th className="p-3.5 font-bold text-center w-28">Gratuito</th>
                <th className="p-3.5 font-bold text-center w-36 text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-950/20">Plano Pro / Pago</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">Acesso a artigos e posts do blog</td>
                <td className="p-3 text-center text-emerald-600 font-bold"><Check size={16} className="mx-auto" /></td>
                <td className="p-3 text-center text-emerald-600 font-bold bg-red-50/30 dark:bg-red-950/10"><Check size={16} className="mx-auto" /></td>
              </tr>
              <tr>
                <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">Download de materiais públicos (A1-B2)</td>
                <td className="p-3 text-center text-emerald-600 font-bold"><Check size={16} className="mx-auto" /></td>
                <td className="p-3 text-center text-emerald-600 font-bold bg-red-50/30 dark:bg-red-950/10"><Check size={16} className="mx-auto" /></td>
              </tr>
              <tr>
                <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">Download de Worksheets C1/C2 e Slides</td>
                <td className="p-3 text-center text-rose-500 font-bold"><XCircle size={16} className="mx-auto" /></td>
                <td className="p-3 text-center text-emerald-600 font-bold bg-red-50/30 dark:bg-red-950/10"><Check size={16} className="mx-auto" /></td>
              </tr>
              <tr>
                <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">Correção de pronúncia ilimitada com IA</td>
                <td className="p-3 text-center text-rose-500 font-bold"><XCircle size={16} className="mx-auto" /></td>
                <td className="p-3 text-center text-emerald-600 font-bold bg-red-50/30 dark:bg-red-950/10"><Check size={16} className="mx-auto" /></td>
              </tr>
              <tr>
                <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">Certificados oficiais com QR Code público</td>
                <td className="p-3 text-center text-rose-500 font-bold"><XCircle size={16} className="mx-auto" /></td>
                <td className="p-3 text-center text-emerald-600 font-bold bg-red-50/30 dark:bg-red-950/10"><Check size={16} className="mx-auto" /></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-xl text-xs font-bold transition-colors text-center"
          >
            Fechar
          </button>

          <button
            onClick={handleDirectCheckout}
            disabled={loadingCheckout}
            className="w-full sm:w-auto flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-600/25 flex items-center justify-center gap-2"
          >
            {loadingCheckout ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Processando Checkout...</span>
              </>
            ) : (
              <>
                <CreditCard size={16} />
                <span>Assinar Plano Pro Direto</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
