import React, { useState } from "react";
import { BookOpen, Send, Sparkles, CheckCircle2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface JournalEntry {
  id: string;
  date: string;
  content: string;
  feedback: string;
  xpEarned: number;
}

const initialEntries: JournalEntry[] = [
  {
    id: "1",
    date: "15 Ago 2026",
    content: "Today I practiced talking about my career goals and why learning English is essential for international research. I feel much more confident using present perfect.",
    feedback: "Excellent reflection! Your sentence structure is robust and accurate. Try incorporating more transitional adverbs like 'furthermore' or 'consequently' next time.",
    xpEarned: 100,
  },
];

export function LearningJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries);
  const [newText, setNewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      const newEntry: JournalEntry = {
        id: String(Date.now()),
        date: "Hoje",
        content: newText,
        feedback: "Great job writing your reflection in English! Your vocabulary is expanding nicely. Keep up the consistent practice.",
        xpEarned: 100,
      };
      setEntries([newEntry, ...entries]);
      setNewText("");
      toast.success("Diário de aprendizagem enviado! +100 XP bônus conquistados.");
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto my-8">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 p-6 sm:p-8 rounded-3xl text-white shadow-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} /> Novo Recurso Pedagógico
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mt-1">Diário de Aprendizagem em Inglês</h2>
          <p className="text-xs text-slate-300 mt-1">Escreva reflexões diárias ou semanais em inglês e receba feedback imediato da inteligência artificial.</p>
        </div>
        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/10 text-center shrink-0">
          <span className="block text-2xl font-black text-amber-400">+100 XP</span>
          <span className="text-[10px] uppercase font-bold text-slate-300">Por reflexão</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="text-red-600" size={18} /> Escreva sua Nova Reflexão
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Write a short paragraph in English about your day, your goals, or what you learned in class..."
            className="bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-xs font-mono min-h-[120px] rounded-2xl p-4"
            required
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 text-white font-black text-xs h-11 px-8 rounded-2xl shadow-md gap-2"
            >
              {submitting ? "Analisando com IA..." : <><Send size={15} /> Enviar Diário para Feedback</>}
            </Button>
          </div>
        </form>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar size={16} className="text-red-600" /> Histórico de Diários & Feedback
          </h4>

          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700 pb-2">
                  <span className="text-xs font-bold text-slate-500">{entry.date}</span>
                  <span className="text-xs font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2.5 py-0.5 rounded-full">
                    +{entry.xpEarned} XP
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400">Seu Texto:</span>
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 italic mt-1 leading-relaxed">"{entry.content}"</p>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 p-3.5 rounded-xl space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-emerald-600" /> Feedback do Professor Virtual (IA)
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{entry.feedback}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
