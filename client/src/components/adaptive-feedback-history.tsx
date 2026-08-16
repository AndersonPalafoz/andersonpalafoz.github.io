import React, { useState } from "react";
import { ThumbsUp, Sparkles, BookOpen, CheckCircle2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface LikedItem {
  id: string;
  topic: string;
  recommendedMaterial: string;
  xpBonus: number;
  likedAt: string;
}

const mockLikedItems: LikedItem[] = [
  {
    id: "l1",
    topic: "Present Perfect vs. Simple Past",
    recommendedMaterial: "Worksheet Avançada: Masterclass de Tempos Verbais",
    xpBonus: 150,
    likedAt: "Hoje, 14:30",
  },
  {
    id: "l2",
    topic: "Pronúncia de Vogais Nasais (/æ/ vs /ʌ/)",
    recommendedMaterial: "Áudio Prático: Master Pronunciation Unit 3",
    xpBonus: 120,
    likedAt: "Ontem, 09:15",
  },
];

export function AdaptiveFeedbackHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [items] = useState<LikedItem[]>(mockLikedItems);

  const filtered = items.filter(
    (item) =>
      item.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.recommendedMaterial.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto my-8">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ThumbsUp className="text-emerald-600" size={20} /> Histórico de Feedbacks da Trilha Adaptativa
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Revise facilmente os conteúdos, tópicos e materiais recomendados pela IA que você marcou como úteis.</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar no histórico..."
              className="pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl text-xs h-10"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <ThumbsUp size={13} />
                    </span>
                    <h4 className="font-black text-xs text-slate-900 dark:text-white">{item.topic}</h4>
                    <span className="text-[10px] font-bold text-slate-400">({item.likedAt})</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 pl-8">
                    <BookOpen size={14} className="text-red-600 shrink-0" />
                    <span>{item.recommendedMaterial}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3 pl-8 sm:pl-0 shrink-0">
                  <span className="text-xs font-black bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-3 py-1 rounded-full">
                    +{item.xpBonus} XP
                  </span>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 size={15} /> Salvo
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-xs text-slate-500 space-y-2">
              <Sparkles size={24} className="mx-auto text-slate-400" />
              <p>Nenhum item encontrado no histórico de feedbacks.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
