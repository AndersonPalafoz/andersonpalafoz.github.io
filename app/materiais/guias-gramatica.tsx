'use client';

import { useState } from "react";
import { Download, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface GrammarGuide {
  id: string;
  title: string;
  level: string;
  pages: number;
  description: string;
  fileSize: string;
}

export function GrammarGuidesSection() {
  const [guides] = useState<GrammarGuide[]>([
    {
      id: "g1",
      title: "Guia Definitivo: Tempos Verbais no Passado (Simple Past vs. Past Continuous)",
      level: "A2-B1",
      pages: 12,
      description: "Explicação detalhada com exemplos práticos, estruturas sintáticas e exercícios comentados.",
      fileSize: "2.4 MB"
    },
    {
      id: "g2",
      title: "Masterclass de Modais: Expressando Habilidade, Possibilidade e Obrigatoriedade",
      level: "B1-B2",
      pages: 16,
      description: "Guia avançado sobre o uso de can, could, must, should, might e suas nuances no inglês profissional.",
      fileSize: "3.1 MB"
    },
    {
      id: "g3",
      title: "Manual de Pronúncia e Fonética: Consoantes Interdentais ('th')",
      level: "A1-B2",
      pages: 8,
      description: "Instruções visuais e fonéticas para aperfeiçoar a articulação e eliminar o sotaque interferente.",
      fileSize: "1.8 MB"
    }
  ]);

  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);

  const handleDownload = (guide: GrammarGuide) => {
    setDownloadedIds(prev => [...prev, guide.id]);
    toast.success(`Baixando "${guide.title}" (PDF)...`);
  };

  return (
    <section className="py-16 px-4 md:px-8 lg:px-16 bg-white border-t border-slate-200 dark:border-slate-800 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Guias Autorais em PDF
            </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-2">Guias de Gramática para Download</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Materiais compilados pelo professor para estudo aprofundado e consulta rápida.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {guides.map((guide) => {
            const isDownloaded = downloadedIds.includes(guide.id);
            return (
              <div key={guide.id} className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-6 rounded-3xl shadow-xs flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="h-10 w-10 rounded-2xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center font-black">
                      <FileText size={20} />
                    </span>
                    <span className="bg-red-600 text-white px-2.5 py-1 rounded-full text-[10px] font-black uppercase">
                      {guide.level} • {guide.fileSize}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">{guide.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{guide.description}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownload(guide)}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition shadow-sm ${
                    isDownloaded 
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                >
                  {isDownloaded ? <CheckCircle2 size={16} /> : <Download size={16} />}
                  <span>{isDownloaded ? "PDF Baixado com Sucesso" : `Baixar Guia PDF (${guide.pages} págs)`}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
