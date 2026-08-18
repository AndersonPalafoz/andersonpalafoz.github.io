"use client";

import { useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function SaveMaterialButton({ materialId, initialSaved = false }: { materialId: number; initialSaved?: boolean }) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  async function toggleSaved() {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch(saved ? `/api/materials/saved?materialId=${materialId}` : "/api/materials/saved", {
        method: saved ? "DELETE" : "POST",
        headers: saved ? undefined : { "Content-Type": "application/json" },
        body: saved ? undefined : JSON.stringify({ materialId }),
      });
      const payload = await response.json().catch(() => null);
      if (response.status === 401) throw new Error("Entre na sua conta para salvar materiais.");
      if (!response.ok) throw new Error(payload?.error || "Não foi possível atualizar seus materiais salvos.");
      const nextSaved = !saved;
      setSaved(nextSaved);
      toast.success(nextSaved ? "Material salvo para depois." : "Material removido dos salvos.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar o material.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleSaved}
      disabled={loading}
      aria-label={saved ? "Remover material dos salvos" : "Salvar material para depois"}
      aria-pressed={saved}
      title={saved ? "Remover dos salvos" : "Salvar para depois"}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-red-600 shadow-sm transition hover:border-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-red-950/40"
    >
      {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Heart size={16} className={saved ? "fill-red-600" : ""} aria-hidden="true" />}
    </button>
  );
}
