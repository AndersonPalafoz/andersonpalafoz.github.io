'use client';

import { useState } from "react";
import { Download, FileText, Eye, X, Filter } from "lucide-react";

interface GrammarGuide {
  id: string;
  title: string;
  level: string; // ex: "A2-B1", "B1-B2", "A1-B2", "C1-C2"
  description: string;
  summary: string[];
}

export function GrammarGuidesSection() {
  const [guides] = useState<GrammarGuide[]>([
    {
      id: "g1",
      title: "Guia Definitivo: Tempos Verbais no Passado (Simple Past vs. Past Continuous)",
      level: "A2-B1",
      description: "Explicação detalhada com exemplos práticos, estruturas sintáticas e exercícios comentados.",
      summary: [
        "1. Introdução à Morfologia do Passado Simples",
        "2. Verbos Regulares vs. Irregulares (Tabela de Apoio)",
        "3. Past Continuous: Ações em Andamento",
        "4. Conjunções de Contraste (When vs. While)",
        "5. Gabarito Comentado e Exercícios Práticos"
      ]
    },
    {
      id: "g2",
      title: "Masterclass de Modais: Expressando Habilidade, Possibilidade e Obrigatoriedade",
      level: "B1-B2",
      description: "Guia avançado sobre o uso de can, could, must, should, might e suas nuances no inglês profissional.",
      summary: [
        "1. Fundamentos dos Verbos Modais na Sintaxe Inglesa",
        "2. Habilidade e Permissão (Can, Could, Be able to)",
        "3. Obrigação e Conselho (Must, Have to, Should)",
        "4. Dedução e Probabilidade no Passado e Presente",
        "5. Casos Práticos de Redação Acadêmica"
      ]
    },
    {
      id: "g3",
      title: "Manual de Pronúncia e Fonética: Consoantes Interdentais ('th')",
      level: "A1-B2",
      description: "Instruções visuais e fonéticas para aperfeiçoar a articulação e eliminar o sotaque interferente.",
      summary: [
        "1. Anatomia da Articulação Interdental (Voiced vs. Voiceless)",
        "2. Pares Mínimos para Treino Diário",
        "3. Frases de Fluência e Ritmo de Fraseado",
        "4. Dicas de Gravação e Autoavaliação de Pronúncia"
      ]
    },
    {
      id: "g4",
      title: "Advanced Syntax & Subjunctive Mood in Academic Discourse",
      level: "C1-C2",
      description: "Guia de alta proficiência para estruturação de textos acadêmicos e uso do subjuntivo.",
      summary: [
        "1. O Subjuntivo em Orações Subordinadas Avançadas",
        "2. Inversão Sintática para Ênfase e Formalidade",
        "3. Coesão Textual e Conectores de Nível C2",
        "4. Análise Crítica de Textos Literários"
      ]
    }
  ]);

  const [selectedGuide, setSelectedGuide] = useState<GrammarGuide | null>(null);
  const [activeLevelFilter, setActiveLevelFilter] = useState<string>("all");

  const levels = ["all", "A1", "A2", "B1", "B2", "C1", "C2"];

  const filteredGuides = guides.filter(guide => {
    if (activeLevelFilter === "all") return true;
    return guide.level.includes(activeLevelFilter);
  });

  const downloadUnavailableMessage = "O arquivo PDF deste guia ainda não está disponível.";

  return (
    <section className="py-16 px-4 md:px-8 lg:px-16 bg-white border-t border-slate-200 dark:border-slate-800 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Guias Autorais em PDF
            </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-2">Guias de Gramática para Download</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Materiais compilados pelo professor para estudo aprofundado e consulta rápida.</p>
          </div>

          {/* Filtros por Nível de Proficiência (A1-C2) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
            <span className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1 mr-1">
              <Filter size={13} /> Nível:
            </span>
            {levels.map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setActiveLevelFilter(lvl)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                  activeLevelFilter === lvl
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {lvl === "all" ? "Todos" : lvl}
              </button>
            ))}
          </div>
        </div>

        {filteredGuides.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-700">
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Nenhum guia encontrado para o nível selecionado ({activeLevelFilter}).</p>
            <button
              type="button"
              onClick={() => setActiveLevelFilter("all")}
              className="mt-3 text-xs font-black uppercase text-red-600 hover:underline"
            >
              Ver todos os guias
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredGuides.map((guide) => {
              return (
                <div key={guide.id} className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-6 rounded-3xl shadow-xs flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="h-10 w-10 rounded-2xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center font-black">
                        <FileText size={20} />
                      </span>
                      <span className="bg-red-600 text-white px-2.5 py-1 rounded-full text-[10px] font-black uppercase">
                        Nível {guide.level}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">{guide.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{guide.description}</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedGuide(guide)}
                      className="w-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition"
                    >
                      <Eye size={16} /> Pré-visualizar Sumário
                    </button>

                    <button
                      type="button"
                      disabled
                      title={downloadUnavailableMessage}
                      className="w-full cursor-not-allowed rounded-xl bg-slate-200 px-4 py-2.5 text-xs font-black text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                    >
                      <span className="inline-flex items-center justify-center gap-2">
                        <Download size={16} /> PDF indisponível
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal de Pré-visualização do Sumário */}
        {selectedGuide && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative animate-fade-in">
              <button
                type="button"
                onClick={() => setSelectedGuide(null)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={20} />
              </button>

              <div className="space-y-2">
                <span className="bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                  Sumário • {selectedGuide.level}
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">{selectedGuide.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">{selectedGuide.description}</p>
              </div>

              <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-500">Tópicos do guia:</p>
                <ul className="space-y-2">
                  {selectedGuide.summary.map((item, idx) => (
                    <li key={idx} className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedGuide(null)}
                  className="flex-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 py-3 rounded-xl font-bold text-xs transition"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  disabled
                  title={downloadUnavailableMessage}
                  className="flex-1 cursor-not-allowed rounded-xl bg-slate-200 py-3 text-xs font-bold text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <Download size={16} /> PDF indisponível
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
