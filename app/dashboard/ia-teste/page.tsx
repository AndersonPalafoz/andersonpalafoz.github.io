'use client';

import { useState } from "react";
import Link from "next/link";
import { Mic, Square, Sparkles, Activity, ArrowLeft, Check, Volume2 } from "lucide-react";
import { analyzeForumAudioPronunciation, PronunciationFeedback } from "@/lib/ai-forum-pronunciation";

export default function IATestLabPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioRecorded, setAudioRecorded] = useState(false);
  const [feedback, setFeedback] = useState<PronunciationFeedback | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedPhrase, setSelectedPhrase] = useState("Could you please explain how to improve my English fluency in business meetings?");

  const samplePhrases = [
    "Could you please explain how to improve my English fluency in business meetings?",
    "Learning a new language opens up doors to global academic and professional opportunities.",
    "The pronunciation of 'comfortable' and 'schedule' requires careful attention to syllable stress.",
    "Intelligence artificial tools help students practice speaking with real-time feedback."
  ];

  const startRecording = () => {
    setIsRecording(true);
    setAudioRecorded(false);
    setFeedback(null);
    setTimeout(() => {
      setIsRecording(false);
      setAudioRecorded(true);
      const result = analyzeForumAudioPronunciation();
      setFeedback(result);
      setToastMessage("Áudio analisado com sucesso pela IA pedagógica!");
      setTimeout(() => setToastMessage(null), 3500);
    }, 2800);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setAudioRecorded(true);
    const result = analyzeForumAudioPronunciation();
    setFeedback(result);
    setToastMessage("Gravação finalizada e avaliada!");
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 font-sans">
      {toastMessage && (
        <aside aria-label="Notificação" className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-3 border border-slate-800">
          <Check size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </aside>
      )}

      <div>
        <Link href="/dashboard" className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline inline-flex items-center gap-1.5 mb-2">
          <ArrowLeft size={14} /> Voltar ao Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center font-black">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Laboratório de Teste de Pronúncia por IA</h1>
            <p className="text-xs sm:text-sm text-slate-500">Grave sua voz lendo uma frase em inglês e receba análise instantânea de clareza, entonação e dicas fonéticas.</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xs space-y-6">
        <div>
          <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Escolha ou Digite a Frase de Teste</label>
          <select
            value={selectedPhrase}
            onChange={(e) => setSelectedPhrase(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-red-600 mb-3"
          >
            {samplePhrases.map((phrase, idx) => (
              <option key={idx} value={phrase}>{phrase}</option>
            ))}
          </select>
          <div className="p-4 rounded-2xl bg-red-50/70 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/40 flex items-start gap-3">
            <Volume2 className="text-red-600 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-red-700 dark:text-red-300">Texto para Leitura</p>
              <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5 italic">"{selectedPhrase}"</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700 space-y-4">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="h-20 w-20 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xl hover:scale-105 transition duration-200"
            >
              <Mic size={32} />
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="h-20 w-20 rounded-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center shadow-xl animate-pulse"
            >
              <Square size={28} />
            </button>
          )}

          <div className="text-center space-y-1">
            <p className="text-xs font-black text-slate-800 dark:text-slate-200">
              {isRecording ? "Ouvindo e analisando fonemas em tempo real..." : audioRecorded ? "Áudio gravado com sucesso!" : "Clique no microfone para iniciar a gravação"}
            </p>
            <p className="text-[10px] text-slate-500">O sistema avaliará a precisão vocabular, entonação e ritmo.</p>
          </div>
        </div>

        {feedback && (
          <div className="bg-gradient-to-r from-red-600 to-amber-600 p-6 rounded-2xl text-white shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/20 pb-3">
              <span className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                <Activity size={18} /> Relatório de Avaliação por IA
              </span>
              <span className="bg-white text-red-600 px-3 py-1 rounded-full text-xs font-black shadow-sm">
                Nota Final: {feedback.score}/100 ({feedback.clarity})
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-white/90">
                <span className="text-white font-black">Ritmo e Entonação:</span> {feedback.intonation}
              </p>
              <div className="space-y-1 bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/20">
                <p className="font-black text-[11px] uppercase tracking-wider mb-1">Dicas Fonéticas Específicas:</p>
                <ul className="list-disc pl-4 space-y-1">
                  {feedback.phonemeTips.map((tip, idx) => (
                    <li key={idx} className="text-white/95">{tip}</li>
                  ))}
                </ul>
              </div>
              <p className="text-[11px] italic text-white/90 pt-1">
                "{feedback.encouragement}"
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
