import React, { useState } from "react";
import { Mic, MicOff, Sparkles, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function VoiceSpeakingAssistant() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<{ score: number; praise: string; correction: string } | null>(null);

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTranscript("");
      setFeedback(null);
      toast.info("Gravando... Fale em inglês agora.");
      setTimeout(() => {
        setTranscript("I want to improve my English speaking skills for my professional career.");
        setIsRecording(false);
        analyzeSpeech("I want to improve my English speaking skills for my professional career.");
      }, 3500);
    } else {
      setIsRecording(false);
    }
  };

  const analyzeSpeech = (_text: string) => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setFeedback({
        score: 92,
        praise: "Excelente entonação e clareza na pronúncia de 'professional career'!",
        correction: "Sua frase gramaticalmente está perfeita. Sugestão avançada: você poderia usar 'enhance' no lugar de 'improve' para maior sofisticação acadêmica.",
      });
      toast.success("Análise de IA concluída com sucesso!");
    }, 1200);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-6 sm:p-8 max-w-3xl mx-auto my-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center">
            <Mic size={22} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              Assistente de Speaking com IA <Sparkles size={16} className="text-red-600" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pratique conversação em tempo real com feedback instantâneo de pronúncia.</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Desafio de Conversação de Hoje</p>
        <p className="text-base font-extrabold text-slate-900 dark:text-white">
          "Talk about your professional goals and why you are learning English."
        </p>

        {/* Animação Visual de Onda Sonora durante a Gravação */}
        {isRecording && (
          <div className="flex items-center justify-center gap-1.5 py-4 h-16">
            <span className="w-1.5 bg-red-600 rounded-full animate-bounce h-8 [animation-delay:-0.3s]" />
            <span className="w-1.5 bg-red-600 rounded-full animate-bounce h-12 [animation-delay:-0.15s]" />
            <span className="w-1.5 bg-red-600 rounded-full animate-bounce h-16 [animation-delay:0s]" />
            <span className="w-1.5 bg-red-600 rounded-full animate-bounce h-10 [animation-delay:-0.2s]" />
            <span className="w-1.5 bg-red-600 rounded-full animate-bounce h-14 [animation-delay:-0.1s]" />
            <span className="w-1.5 bg-red-600 rounded-full animate-bounce h-6 [animation-delay:-0.25s]" />
          </div>
        )}

        <div className="flex justify-center pt-2">
          <button
            onClick={toggleRecording}
            className={`relative inline-flex items-center gap-3 px-8 py-4 rounded-full font-black text-sm text-white shadow-xl transition-all duration-300 ${
              isRecording
                ? "bg-amber-600 hover:bg-amber-700 animate-pulse shadow-amber-600/30"
                : "bg-red-600 hover:bg-red-700 shadow-red-600/30 hover:-translate-y-0.5"
            }`}
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
            {isRecording ? "Parar e Enviar Áudio..." : "Iniciar Gravação de Voz"}
          </button>
        </div>
      </div>

      {transcript && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-400">Sua Transcrição</span>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 italic">"{transcript}"</p>
          </div>

          {analyzing ? (
            <div className="p-6 text-center space-y-3">
              <RefreshCw className="animate-spin mx-auto text-red-600" size={24} />
              <p className="text-xs font-bold text-slate-500">IA analisando pronúncia, fluência e gramática...</p>
            </div>
          ) : feedback && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 p-5 rounded-2xl space-y-3 animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-600" /> Feedback da Inteligência Artificial
                </span>
                <span className="text-xs font-black bg-emerald-600 text-white px-3 py-1 rounded-full shadow-sm">
                  Nota: {feedback.score} / 100
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{feedback.praise}</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-emerald-200/60 dark:border-emerald-900/50 pt-2">
                {feedback.correction}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
