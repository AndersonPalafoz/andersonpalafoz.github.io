"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Heart, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface SavedMaterialItem {
  materialId: number;
  material: { id: number; title: string; description: string | null; category: string; level: string } | null;
}

export function SavedMaterialsSection() {
  const [items, setItems] = useState<SavedMaterialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<number | null>(null);

  async function load() {
    try {
      const response = await fetch("/api/materials/saved", { cache: "no-store" });
      if (response.status === 401) return;
      if (!response.ok) throw new Error("Não foi possível carregar os materiais salvos.");
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao carregar materiais salvos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function remove(materialId: number) {
    setRemoving(materialId);
    try {
      const response = await fetch(`/api/materials/saved?materialId=${materialId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Não foi possível remover o material salvo.");
      setItems((current) => current.filter((item) => item.materialId !== materialId));
      toast.success("Material removido dos salvos.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao remover material.");
    } finally {
      setRemoving(null);
    }
  }

  if (loading) return <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6"><Loader2 className="animate-spin text-red-600" aria-label="Carregando materiais salvos" /></section>;
  if (items.length === 0) return null;

  return (
    <section className="mt-10 space-y-4" aria-labelledby="saved-materials-title">
      <div className="flex items-center gap-3"><Heart className="fill-red-600 text-red-600" size={24} /><div><h2 id="saved-materials-title" className="text-2xl font-extrabold text-gray-900">Materiais salvos</h2><p className="text-sm text-gray-600">Conteúdos guardados para estudar depois.</p></div></div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map(({ materialId, material }) => material && (
          <article key={materialId} className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div><div className="mb-3 flex items-center justify-between gap-2"><span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">{material.level}</span><span className="text-xs font-semibold uppercase text-gray-400">{material.category}</span></div><h3 className="font-extrabold leading-snug text-gray-900">{material.title}</h3><p className="mt-2 line-clamp-2 text-sm text-gray-600">{material.description || "Material didático salvo para consulta posterior."}</p></div>
            <div className="mt-5 flex items-center justify-between gap-2"><Link href={`/materiais/${material.id}`} className="inline-flex items-center gap-1 text-sm font-bold text-red-600 hover:underline"><BookOpen size={16} /> Ver material</Link><button type="button" onClick={() => remove(materialId)} disabled={removing === materialId} aria-label={`Remover ${material.title} dos salvos`} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-60">{removing === materialId ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Remover</button></div>
          </article>
        ))}
      </div>
    </section>
  );
}
