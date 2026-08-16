import React, { useState } from "react";
import { Trophy, Award, Flame, CheckCircle2, XCircle, RotateCcw, Sparkles, Star } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const sampleQuiz: Question[] = [
  {
    id: 1,
    question: "Choose the correct sentence in Present Perfect:",
    options: [
      "I have visited London last year.",
      "I have visited London three times.",
      "I visiting London yesterday.",
      "I has visit London."
    ],
    correct: 1,
    explanation: "Present Perfect is used with unfinished time or experience (three times). 'Last year' requires Simple Past."
  },
  {
    id: 2,
    question: "What is the correct negative form of 'She likes coffee'?",
    options: [
      "She don't like coffee.",
      "She doesn't likes coffee.",
      "She doesn't like coffee.",
      "She not like coffee."
    ],
    correct: 2,
    explanation: "For third-person singular in Simple Present, use 'doesn't' + base verb ('like')."
  },
  {
    id: 3,
    question: "Which modal verb expresses strict obligation?",
    options: ["might", "must", "could", "should"],
    correct: 1,
    explanation: "'Must' expresses strong obligation or necessity."
  }
];

const mockLeaderboard = [
  { rank: 1, name: "Maria Clara", points: 420, level: "Advanced (C1)", streak: 14 },
  { rank: 2, name: "Anderson Palafoz", points: 390, level: "Expert (C2)", streak: 21 },
  { rank: 3, name: "João Pedro", points: 350, level: "Upper-Intermediate (B2)", streak: 9 },
  { rank: 4, name: "Ana Beatriz", points: 310, level: "Intermediate (B1)", streak: 6 },
  { rank: 5, name: "Lucas Gabriel", points: 280, level: "Elementary (A2)", streak: 4 },
];

export function GamifiedQuiz() {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [tab, setTab] = useState<"quiz" | "leaderboard">("quiz");

  const handleSelect = (idx: number) => {
    if (selectedOpt !== null) return;
    setSelectedOpt(idx);
    const isCorrect = idx === sampleQuiz[currentQ].correct;
    if (isCorrect) {
      setScore((prev) => prev + 50);
      toast.success("Correto! +50 XP");
    } else {
      toast.error("Incorreto!");
    }
  };

  const handleNext = () => {
    if (currentQ < sampleQuiz.length - 1) {
      setCurrentQ((prev) => prev + 1);
      setSelectedOpt(null);
    } else {
      setShowResult(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQ(0);
    setSelectedOpt(null);
    setScore(0);
    setShowResult(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden max-w-3xl mx-auto my-8">
      <div className="bg-gradient-to-r from-red-600 to-rose-700 p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-red-100 text-xs font-bold uppercase tracking-widest">
            <Sparkles size={14} /> Arena Gamificada & Placar
          </div>
          <h2 className="text-2xl font-black mt-1">Desafios de Inglês & Leaderboard</h2>
        </div>
        <div className="flex items-center bg-white/10 p-1.5 rounded-2xl backdrop-blur-md">
          <button
            onClick={() => setTab("quiz")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${tab === "quiz" ? "bg-white text-red-600 shadow-md" : "text-white hover:bg-white/10"}`}
          >
            Quiz de Hoje
          </button>
          <button
            onClick={() => setTab("leaderboard")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${tab === "leaderboard" ? "bg-white text-red-600 shadow-md" : "text-white hover:bg-white/10"}`}
          >
            Placar da Turma
          </button>
        </div>
      </div>

      <div className="p-6">
        {tab === "quiz" ? (
          <div>
            {!showResult ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                  <span>Questão {currentQ + 1} de {sampleQuiz.length}</span>
                  <span className="flex items-center gap-1 text-red-600 bg-red-50 dark:bg-red-950/50 px-3 py-1 rounded-full font-black">
                    <Star size={13} className="fill-red-600" /> {score} XP
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {sampleQuiz[currentQ].question}
                </h3>

                <div className="space-y-3">
                  {sampleQuiz[currentQ].options.map((opt, idx) => {
                    let btnStyle = "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-red-300";
                    if (selectedOpt !== null) {
                      if (idx === sampleQuiz[currentQ].correct) {
                        btnStyle = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-bold";
                      } else if (idx === selectedOpt) {
                        btnStyle = "border-red-500 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200";
                      }
                    }
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelect(idx)}
                        disabled={selectedOpt !== null}
                        className={`w-full text-left p-4 rounded-2xl border-2 font-medium text-sm transition-all flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {selectedOpt !== null && idx === sampleQuiz[currentQ].correct && <CheckCircle2 className="text-emerald-600 shrink-0" size={18} />}
                        {selectedOpt !== null && idx === selectedOpt && idx !== sampleQuiz[currentQ].correct && <XCircle className="text-red-600 shrink-0" size={18} />}
                      </button>
                    );
                  })}
                </div>

                {selectedOpt !== null && (
                  <div className="bg-slate-100 dark:bg-slate-800/80 p-4 rounded-2xl text-xs text-slate-700 dark:text-slate-300 space-y-2 animate-in fade-in">
                    <p className="font-bold">Explicação pedagógica:</p>
                    <p>{sampleQuiz[currentQ].explanation}</p>
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleNext}
                        className="bg-red-600 hover:bg-red-700 text-white font-black px-6 py-2.5 rounded-xl shadow-md transition"
                      >
                        {currentQ < sampleQuiz.length - 1 ? "Próxima Questão →" : "Ver Resultado Final"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 space-y-6 animate-in zoom-in-95">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-950 text-red-600 shadow-inner">
                  <Trophy size={40} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Desafio Concluído!</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Você acumulou {score} pontos XP nesta rodada.</p>
                </div>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={restartQuiz}
                    className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold px-6 py-3 rounded-2xl text-xs transition"
                  >
                    <RotateCcw size={15} /> Tentar Novamente
                  </button>
                  <button
                    onClick={() => setTab("leaderboard")}
                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-black px-6 py-3 rounded-2xl text-xs shadow-lg shadow-red-600/25 transition"
                  >
                    <Trophy size={15} /> Ver Placar da Turma
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-extrabold uppercase text-slate-400">Classificação Geral da Turma</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Flame size={13} className="text-orange-500" /> Ofensiva ativa
              </span>
            </div>

            <div className="space-y-2.5">
              {mockLeaderboard.map((item) => (
                <div
                  key={item.rank}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition ${
                    item.rank === 1
                      ? "bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`h-8 w-8 rounded-xl font-black text-xs flex items-center justify-center ${
                      item.rank === 1 ? "bg-amber-500 text-white" : item.rank === 2 ? "bg-slate-300 text-slate-800" : item.rank === 3 ? "bg-amber-700 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}>
                      #{item.rank}
                    </span>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        {item.name} {item.rank === 1 && <Award size={15} className="text-amber-500" />}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.level} • 🔥 {item.streak} dias seguidos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-sm text-red-600 dark:text-red-400">{item.points} XP</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
