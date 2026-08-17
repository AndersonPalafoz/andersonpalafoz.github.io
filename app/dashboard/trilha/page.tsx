'use client';

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle2, Compass } from "lucide-react";

export default function AdaptiveLearningPage() {
  const [completedRecs, setCompletedRecs] = useState<Record<string, boolean>>({});

  const recommendations = [
    {
      id: "rec-1",
      topic: "Revisão de Estruturas Verbais (Simple Present x Continuous)",
      reason: "Identificado através de menor aproveitamento em quizzes de gramática recente.",
      suggestedAction: "Estudar aula prática e refazer o exercício de fixação",
      targetUrl: "/aulas",
      priority: "high",
      cefrLevel: "A2"
    },
    {
      id: "rec-2",
      topic: "Consolidação de Pronúncia em Frases Curtas (Speaking)",
      reason: "Manutenção da ofensiva e aprimoramento da entonação no assistente de voz.",
      suggestedAction: "Gravar atividade de áudio recomendada",
      targetUrl: "/dashboard",
      priority: "medium",
      cefrLevel: "B1"
    },
    {
      id: "rec-3",
      topic: "Leitura Acadêmica e Vocabulário Contextualizado",
      reason: "Preparação para textos de nível intermediário-superior.",
      suggestedAction: "Baixar material complementar na Biblioteca",
      targetUrl: "/materiais",
      priority: "low",
      cefrLevel: "B2"
    }
  ];

  const toggleComplete = (id: string) => {
    setCompletedRecs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(completedRecs).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / recommendations.length) * 100);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 font-sans">
      <div className="bg-gradient-to-r from-red-600 to-amber-600 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
            <Sparkles size={15} /> IA Pedagógica Adaptativa
          </div>
          <h1 className="text-3xl font-black tracking-tight">Sua Trilha Personalizada de Estudos</h1>
          <p className="text-white/90 text-sm max-w-xl leading-relaxed">
            Com base em seu histórico de desempenho em quizzes e atividades, nossa IA estruturou um roteiro sob medida para eliminar suas dúvidas e acelerar sua fluência em inglês.
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl text-center min-w-[200px]">
          <p className="text-xs uppercase font-bold text-white/80 tracking-wider mb-1">Progresso da Trilha</p>
          <p className="text-4xl font-black">{progressPercent}%</p>
          <div className="w-full bg-white/20 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-white h-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="text-red-600" size={22} /> Recomendações Prioritárias para Você
          </h2>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            {completedCount} de {recommendations.length} concluídas
          </span>
        </div>

        <div className="grid gap-4">
          {recommendations.map((rec) => {
            const isDone = completedRecs[rec.id];
            return (
              <div 
                key={rec.id}
                className={`p-6 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white dark:bg-slate-900 ${isDone ? "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20" : "border-slate-200 dark:border-slate-800 shadow-xs hover:border-red-300"}`}
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      rec.priority === "high" ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300" :
                      rec.priority === "medium" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300" :
                      "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                    }`}>
                      Prioridade {rec.priority === "high" ? "Alta" : rec.priority === "medium" ? "Média" : "Baixa"}
                    </span>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                      Nível {rec.cefrLevel}
                    </span>
                  </div>
                  <h3 className={`text-base font-black ${isDone ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-900 dark:text-white"}`}>
                    {rec.topic}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {rec.reason}
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => toggleComplete(rec.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${isDone ? "bg-emerald-600 text-white" : "border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"}`}
                  >
                    <CheckCircle2 size={16} className={isDone ? "text-white" : "text-emerald-500"} />
                    {isDone ? "Concluído" : "Marcar Concluído"}
                  </button>

                  <Link href={rec.targetUrl}>
                    <button
                      type="button"
                      className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-sm flex items-center gap-2 transition"
                    >
                      {rec.suggestedAction} <ArrowRight size={14} />
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
