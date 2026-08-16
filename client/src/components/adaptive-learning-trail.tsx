import React, { useState } from "react";
import { Sparkles, Brain, CheckCircle2, ArrowRight, BookOpen, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface TrailRecommendation {
  id: string;
  topic: string;
  reason: string;
  recommendedMaterial: string;
  xpBonus: number;
  completed: boolean;
}

const initialRecommendations: TrailRecommendation[] = [
  {
    id: "rec1",
    topic: "Present Perfect vs. Simple Past",
    reason: "Identificamos hesitação em 3 questões recentes sobre tempo verbal em seu quiz de B1.",
    recommendedMaterial: "Worksheet Avançada: Masterclass de Tempos Verbais",
    xpBonus: 150,
    completed: false,
  },
  {
    id: "rec2",
    topic: "Pronúncia de Vogais Nasais (/æ/ vs /ʌ/)",
    reason: "Sua última sessão de Speaking com IA apontou necessidade de ajuste fonético nesta frequência.",
    recommendedMaterial: "Áudio Prático: Master Pronunciation Unit 3",
    xpBonus: 120,
    completed: false,
  },
];

export function AdaptiveLearningTrail() {
  const [recommendations, setRecommendations] = useState<TrailRecommendation[]>(initialRecommendations);
  const [analyzing, setAnalyzing] = useState(false);

  const handleRunAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      toast.success("IA reanalisou seu histórico e atualizou sua Trilha Adaptativa com sucesso!");
    }, 1500);
  };

  const handleComplete = (id: string) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: true } : r))
    );
    toast.success("Missão da trilha adaptativa concluída! +XP bônus adicionado.");
  };

  const completedCount = recommendations.filter((r) => r.completed).length;
  const progressPercent = Math.round((completedCount / recommendations.length) * 100);

  return (
    <div className="space-y-6 max-w-4xl mx-auto my-8">
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-2xl border border-red-900/40 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
            <Brain size={16} /> Inteligência Artificial Pedagógica
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mt-1">Trilha de Aprendizagem Adaptativa</h2>
          <p className="text-xs text-slate-300 mt-1">Recomendações customizadas em tempo real baseadas nas suas lacunas de gramática e speaking.</p>
        </div>
        <div className="flex flex-col sm:items-end gap-3 shrink-0">
          <Button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-11 px-6 rounded-2xl shadow-md gap-2"
          >
            <RefreshCw size={15} className={analyzing ? "animate-spin" : ""} />
            {analyzing ? "Analisando..." : "Reanalisar Lacunas"}
          </Button>
        </div>
      </div>

      {/* Barra de Progresso Visual da Trilha */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={16} className="text-emerald-600" /> Progresso da Trilha Adaptativa
          </span>
          <span className="font-black text-red-600 dark:text-red-400">{completedCount} de {recommendations.length} focos concluídos ({progressPercent}%)</span>
        </div>
        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700">
          <div
            className="h-full bg-gradient-to-r from-red-600 to-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className={`p-6 rounded-3xl border transition-all space-y-4 ${
              rec.completed
                ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${rec.completed ? "bg-emerald-100 text-emerald-700" : "bg-red-50 text-red-600 dark:bg-red-950/60"}`}>
                  {rec.completed ? <CheckCircle2 size={20} /> : <Sparkles size={20} />}
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400">Foco Recomendado pela IA</span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">{rec.topic}</h3>
                </div>
              </div>
              <span className="text-xs font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-3 py-1 rounded-full shrink-0">
                +{rec.xpBonus} XP Bônus
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700">
                <AlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Diagnóstico:</strong> {rec.reason}</span>
              </p>
              <p className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                <BookOpen size={15} className="text-red-600 shrink-0" />
                <span><strong>Material Sugerido:</strong> {rec.recommendedMaterial}</span>
              </p>
            </div>

            <div className="flex justify-end pt-2">
              {rec.completed ? (
                <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-1.5 py-2">
                  <CheckCircle2 size={16} /> Foco Concluído com Sucesso!
                </span>
              ) : (
                <Button
                  onClick={() => handleComplete(rec.id)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-10 px-6 rounded-xl gap-1.5"
                >
                  Estudar e Concluir Foco <ArrowRight size={14} />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
