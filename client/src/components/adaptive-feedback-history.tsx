import React, { useState } from "react";
import { ThumbsUp, Sparkles, BookOpen, CheckCircle2, Search, Filter, Calendar, FileText, Download, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LikedItem {
  id: string;
  topic: string;
  category: "Gramática" | "Speaking" | "Vocabulário" | "Listening";
  recommendedMaterial: string;
  xpBonus: number;
  likedAt: string;
  dateKey: string;
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
  const [showPreviewModal, setShowPreviewModal] = useState(false);

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

  const handleDownloadPdf = () => {
    toast.success("PDF do histórico de feedbacks baixado com sucesso!");
    setShowPreviewModal(false);
  };

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
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowPreviewModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-black text-xs h-10 px-4 rounded-2xl gap-2 shadow-sm shrink-0"
            >
              <FileText size={15} /> Pré-visualizar / Exportar PDF
            </Button>
          </div>
        </div>

        {/* Barra de Filtros por Categoria e Data */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-2xl">
              <Filter size={14} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Categoria:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-xs font-bold text-red-600 dark:text-red-400 focus:outline-none cursor-pointer"
              >
                <option value="all">Todas</option>
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

          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar no histórico..."
              className="pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl text-xs h-9"
            />
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

      {/* Modal de Pré-visualização do PDF */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6">
            <button
              type="button"
              onClick={() => setShowPreviewModal(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              aria-label="Fechar pré-visualização"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="h-10 w-10 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 flex items-center justify-center shrink-0">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Pré-visualização do Relatório PDF</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Histórico de Feedbacks da Trilha Adaptativa — Anderson Palafoz</p>
              </div>
            </div>

            {/* Simulação do documento PDF */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 max-h-96 overflow-y-auto text-left">
              <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
                <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">Anderson Palafoz Platform</h4>
                <p className="text-[11px] text-slate-500">Relatório Oficial de Sugestões Curtidas na Trilha Adaptativa</p>
              </div>
              <div className="space-y-3">
                {filtered.map((item, idx) => (
                  <div key={item.id} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                    <p className="font-black text-slate-900 dark:text-white">{idx + 1}. {item.topic} <span className="text-red-600">[{item.category}]</span></p>
                    <p className="text-slate-600 dark:text-slate-300">Recomendação: {item.recommendedMaterial}</p>
                    <p className="text-[10px] text-slate-400">Registrado em: {item.likedAt} — Bônus: +{item.xpBonus} XP</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowPreviewModal(false)}
                className="rounded-2xl text-xs font-bold"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDownloadPdf}
                className="bg-red-600 hover:bg-red-700 text-white font-black text-xs h-10 px-6 rounded-2xl gap-2 shadow-md"
              >
                <Download size={15} /> Confirmar & Baixar PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
