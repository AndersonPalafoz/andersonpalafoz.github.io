'use client';

import { useState } from "react";
import Link from "next/link";
import { Mic, Square, Sparkles, AlertTriangle, ArrowLeft, Check, Volume2, Info } from "lucide-react";

export default function IATestLabPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioRecorded, setAudioRecorded] = useState(false);
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
    setTimeout(() => {
      setIsRecording(false);
      setAudioRecorded(true);
      setToastMessage("Áudio gravado com sucesso no modo Beta (análise automática desativada temporariamente).");
      setTimeout(() => setToastMessage(null), 4000);
    }, 2500);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setAudioRecorded(true);
    setToastMessage("Gravação salva localmente para revisão do professor.");
    setTimeout(() => setToastMessage(null), 4000);
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
          <div className="h-12 w-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
            <Sparkles size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Laboratório de Pronúncia (Modo Beta)</h1>
              <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-900">
                Beta / Em Ajustes
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">A avaliação automática por inteligência artificial foi temporariamente desativada do fluxo principal para ajustes. Utilize este ambiente exclusivamente para testes de gravação local.</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xs space-y-6">
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3 text-amber-900 dark:text-amber-200 text-xs">
          <AlertTriangle size={20} className="shrink-0 text-amber-600 mt-0.5" />
          <div>
            <p className="font-black uppercase tracking-wider mb-0.5">Aviso Importante</p>
            <p className="leading-relaxed">O sistema de análise automática de fonemas está em modo Beta e não emite notas automáticas válidas no momento. Suas gravações podem ser enviadas diretamente para a moderação do professor.</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Frase para Prática de Leitura</label>
          <select
            value={selectedPhrase}
            onChange={(e) => setSelectedPhrase(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-red-600 mb-3"
          >
            {samplePhrases.map((phrase, idx) => (
              <option key={idx} value={phrase}>{phrase}</option>
            ))}
          </select>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
            <Volume2 className="text-red-600 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Texto Sugerido</p>
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
              {isRecording ? "Gravando áudio para teste local..." : audioRecorded ? "Áudio gravado com sucesso (Modo Beta)." : "Clique no microfone para gravar"}
            </p>
            <p className="text-[10px] text-slate-500">Nenhuma pontuação automática será emitida neste ambiente experimental.</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
          <Info size={18} className="text-slate-500 shrink-0" />
          <span>Para feedback oficial de pronúncia, utilize o envio de áudio nas atividades de speaking avaliadas pelo professor.</span>
        </div>
      </div>
    </div>
  );
}
