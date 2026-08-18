"use client";

import { useState } from "react";
import { Award, Download, Share2, Check, X } from "lucide-react";
import { toast } from "sonner";

interface MedalCertificateModalProps {
  medalName: string;
  medalDescription: string;
  userName: string;
  awardedDate: string;
  onClose: () => void;
}

export function MedalCertificateModal({ medalName, medalDescription, userName, awardedDate, onClose }: MedalCertificateModalProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const text = `Acabei de conquistar a medalha "${medalName}" na Plataforma Anderson Palafoz! 🚀 #Inglês #Conquista`;
    if (navigator.share) {
      navigator.share({
        title: `Conquista: ${medalName}`,
        text: text,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Texto copiado para a área de transferência!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 h-9 w-9 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
        >
          <X size={18} />
        </button>

        <div className="text-center space-y-3 pt-2">
          <div className="mx-auto h-20 w-20 rounded-3xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center shadow-inner">
            <Award size={40} />
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-50 dark:bg-red-950/40 text-red-600 border border-red-200 dark:border-red-900/60">
            Certificado de Conquista Oficial
          </span>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white">{medalName}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">{medalDescription}</p>
        </div>

        {/* Prévia do Certificado */}
        <div className="rounded-2xl border-2 border-dashed border-red-200 dark:border-red-900/60 bg-red-50/30 dark:bg-red-950/10 p-6 text-center space-y-2">
          <p className="text-[11px] uppercase tracking-widest text-gray-500 font-bold">Certificamos que</p>
          <h4 className="text-xl font-black text-gray-900 dark:text-white">{userName}</h4>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            completou com excelência os requisitos acadêmicos e conquistou o emblema oficial em <strong className="text-red-600">{awardedDate}</strong>.
          </p>
          <div className="pt-3 flex items-center justify-center gap-6 text-[10px] text-gray-400 font-semibold">
            <span>Anderson Palafoz Platform</span>
            <span>•</span>
            <span>Validação Verificada</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-slate-800 bg-card px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-muted transition"
          >
            {copied ? <Check size={16} className="text-emerald-600" /> : <Share2 size={16} />}
            Compartilhar
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-red-600/20 transition hover:bg-red-700"
          >
            <Download size={16} /> Baixar / Imprimir Certificado
          </button>
        </div>
      </div>
    </div>
  );
}
