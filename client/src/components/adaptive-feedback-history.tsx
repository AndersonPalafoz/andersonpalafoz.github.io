import React, { useState } from "react";
import { ThumbsUp, Sparkles, BookOpen, CheckCircle2, Search, Filter, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";

interface LikedItem {
  id: string;
  topic: string;
  category: "Gramática" | "Speaking" | "Vocabulário" | "Listening";
  recommendedMaterial: string;
  xpBonus: number;
  likedAt: string;
  dateKey: string; // YYYY-MM-DD for date filtering
}

const mockLikedItems: LikedItem[] = [
  {
    id: "l1",
    topic: "Present Perfect vs. Simple Past",
    category: "Gramática",
    recommendedMaterial: "Worksheet Avançada: Masterclass de Tempos Verbais",
    xpBonus: 150,
    likedAt: "Hoje, 14:30",
    dateKey: "2026-08-16",
  },
  {
    id: "l2",
    topic: "Pronúncia de Vogais Nasais (/æ/ vs /ʌ/)",
    category: "Speaking",
    recommendedMaterial: "Áudio Prático: Master Pronunciation Unit 3",
    xpBonus: 120,
    likedAt: "Ontem, 09:15",
    dateKey: "2026-08-15",
  },
  {
    id: "l3",
    topic: "Phrasal Verbs Essenciais para Negócios",
    category: "Vocabulário",
    recommendedMaterial: "Glossário Interativo Unit 8",
    xpBonus: 100,
    likedAt: "10 Ago 2026",
    dateKey: "2026-08-10",
  },
];

export function AdaptiveFeedbackHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>("all");
  const [items] = useState<LikedItem[]>(mockLikedItems);

  const filtered = items.filter((item) => {
    const matchesSearch =
      item.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.recommendedMaterial.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesDate =
      selectedDateFilter === "all" ||
      (selectedDateFilter === "today" && item.dateKey === "2026-08-16") ||
      (selectedDateFilter === "week" && item.dateKey >= "2026-08-10");
    return matchesSearch && matchesCategory && matchesDate;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto my-8">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ThumbsUp className="text-emerald-600" size={20} /> Histórico de Feedbacks da Trilha Adaptativa
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Revise e filtre os conteúdos, tópicos e materiais recomendados pela IA que você marcou como úteis.</p>
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

        {/* Barra de Filtros por Categoria e Data */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-2xl">
            <Filter size={14} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Categoria:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs font-bold text-red-600 dark:text-red-400 focus:outline-none cursor-pointer"
            >
              <option value="all">Todas as Categorias</option>
              <option value="Gramática">Gramática</option>
              <option value="Speaking">Speaking</option>
              <option value="Vocabulário">Vocabulário</option>
              <option value="Listening">Listening</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-2xl">
            <Calendar size={14} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Período:</span>
            <select
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-red-600 dark:text-red-400 focus:outline-none cursor-pointer"
            >
              <option value="all">Todo o Período</option>
              <option value="today">Apenas Hoje</option>
              <option value="week">Últimos 7 dias</option>
            </select>
          </div>
        </div>

        <div className="space-y-3 pt-2">
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
                    <span className="text-[10px] font-black bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
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
              <p>Nenhum item encontrado com os filtros selecionados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
