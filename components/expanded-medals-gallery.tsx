"use client";

import { useState } from "react";
import { Award, Lock, Flame, MessageSquare, HelpCircle } from "lucide-react";

interface MedalItem {
  code: string;
  name: string;
  description: string;
  category: string;
  requiredXp: number;
  unlocked: boolean;
  awardedAt?: string;
}

interface ExpandedMedalsGalleryProps {
  medals: MedalItem[];
  totalXp: number;
  streakDays: number;
}

export function ExpandedMedalsGallery({ medals, totalXp }: ExpandedMedalsGalleryProps) {
  const [activeTab, setActiveTab] = useState<string>("all");

  const categories = [
    { id: "all", label: "Todas" },
    { id: "achievement", label: "Conquistas" },
    { id: "streak", label: "Ofensivas", icon: Flame },
    { id: "community", label: "Comunidade", icon: MessageSquare },
    { id: "academic", label: "Acadêmico", icon: HelpCircle },
  ];

  const filteredMedals = activeTab === "all"
    ? medals
    : medals.filter((m) => m.category === activeTab);

  const unlockedCount = medals.filter((m) => m.unlocked).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 surface-card p-6">
        <div>
          <div className="eyebrow mb-2">
            <Award size={16} />
            Galeria de Conquistas & Recompensas
          </div>
          <h2 className="text-2xl font-black text-foreground">Suas Medalhas e Emblemas</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Desbloqueie conquistas estudando diariamente, mantendo sua ofensiva e participando das dúvidas nos materiais.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-2xl p-4">
          <div className="text-center">
            <span className="block text-2xl font-black text-red-600 dark:text-red-400">{unlockedCount} / {medals.length}</span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Desbloqueadas</span>
          </div>
          <div className="h-8 w-px bg-red-200 dark:bg-red-900/60" />
          <div className="text-center">
            <span className="block text-2xl font-black text-gray-900 dark:text-white">{totalXp}</span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">XP Total</span>
          </div>
        </div>
      </div>

      {/* Abas de Filtro */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === cat.id
                ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                : "bg-card text-foreground border border-border hover:bg-muted"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid de Medalhas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMedals.map((medal) => (
          <div
            key={medal.code}
            className={`rounded-3xl border p-6 transition flex flex-col justify-between space-y-4 shadow-xs relative overflow-hidden ${
              medal.unlocked
                ? "border-red-200 dark:border-red-900/60 bg-card"
                : "border-border/60 bg-muted/30 opacity-75"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${
                medal.unlocked ? "bg-red-100 dark:bg-red-950/60 text-red-600" : "bg-gray-200 dark:bg-slate-800 text-gray-400"
              }`}>
                {medal.unlocked ? <Award size={28} /> : <Lock size={22} />}
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                medal.unlocked ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300" : "bg-gray-200 dark:bg-slate-800 text-gray-500"
              }`}>
                {medal.unlocked ? "Conquistada" : `Requer ${medal.requiredXp} XP`}
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-foreground text-base">{medal.name}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{medal.description}</p>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Categoria: <strong className="capitalize">{medal.category}</strong></span>
              {medal.unlocked && medal.awardedAt && (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {new Date(medal.awardedAt).toLocaleDateString("pt-BR")}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
