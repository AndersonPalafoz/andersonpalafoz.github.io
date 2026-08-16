"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function MaterialProgressButton({ materialId }: { materialId: number }) {
  const [completed, setCompleted] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handleProgressUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ materialId?: number }>).detail;
      if (detail?.materialId === materialId) { setCompleted(true); setAuthenticated(true); }
    };
    window.addEventListener("material-progress-updated", handleProgressUpdate);
    void fetch(`/api/materials/${materialId}/progress`, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        setCompleted(Boolean(data.completed));
        setAuthenticated(Boolean(data.authenticated));
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
    return () => window.removeEventListener("material-progress-updated", handleProgressUpdate);
  }, [materialId]);

  const toggle = async () => {
    if (!authenticated) { toast.error("Entre na sua conta para salvar seu progresso."); return; }
    const next = !completed;
    setCompleted(next);
    setSaving(true);
    try {
      const response = await fetch(`/api/materials/${materialId}/progress`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ completed: next }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível atualizar o progresso.");
      toast.success(next ? "Material marcado como concluído." : "Material removido da lista de concluídos.");
    } catch (error) {
      setCompleted(!next);
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar o progresso.");
    } finally { setSaving(false); }
  };

  if (loading || !authenticated) return null;
  return <button type="button" onClick={() => void toggle()} disabled={saving} aria-pressed={completed} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition disabled:cursor-wait disabled:opacity-60 ${completed ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "border-gray-300 bg-white text-gray-700 hover:border-red-300 hover:text-red-600"}`}>
    {saving ? <Loader2 size={17} className="animate-spin" /> : <CheckCircle2 size={17} className={completed ? "fill-emerald-600 text-white" : "text-gray-400"} />}
    {completed ? "Material concluído" : "Marcar como concluído"}
  </button>;
}
