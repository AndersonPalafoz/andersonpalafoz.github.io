"use client";

import { FormEvent, useState } from "react";
import { Edit3, Loader2, Trash2, X } from "lucide-react";

type Activity = { id: number; title: string; description?: string | null; dueDate: string | Date | null };

type Props = { activities: Activity[]; onChanged: () => Promise<void> };

export function InternalClassActivitiesPanel({ activities, onChanged }: Props) {
  const [editing, setEditing] = useState<Activity | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const data = new FormData(event.currentTarget);
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/admin/atividades", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, title: String(data.get("title") || ""), description: String(data.get("description") || ""), dueDate: String(data.get("dueDate") || "") || null }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível atualizar a atividade.");
      setEditing(null);
      await onChanged();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível atualizar a atividade.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(activity: Activity) {
    if (!window.confirm(`Excluir a atividade “${activity.title}”? O histórico de progresso associado será removido.`)) return;
    setDeletingId(activity.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/atividades?id=${activity.id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível excluir a atividade.");
      await onChanged();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível excluir a atividade.");
    } finally {
      setDeletingId(null);
    }
  }

  return <div className="mt-5 flex flex-col gap-3">
    {activities.length ? activities.map((activity) => <div key={activity.id} className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-foreground">{activity.title}</p><p className="text-sm text-muted-foreground">{activity.dueDate ? `Prazo: ${new Date(activity.dueDate).toLocaleDateString("pt-BR")}` : "Sem prazo definido"}</p></div><div className="flex items-center gap-2"><button type="button" onClick={() => setEditing(activity)} className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-bold text-foreground hover:bg-muted"><Edit3 size={13} aria-hidden="true" />Editar</button><button type="button" onClick={() => void remove(activity)} disabled={deletingId === activity.id} className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 px-2 py-1 text-xs font-bold text-destructive hover:bg-destructive/10 disabled:opacity-60"><Trash2 size={13} aria-hidden="true" />{deletingId === activity.id ? "Excluindo" : "Excluir"}</button></div></div>) : <p className="py-8 text-sm text-muted-foreground">Nenhuma atividade cadastrada nesta turma.</p>}
    {error && <p className="text-sm font-semibold text-destructive">{error}</p>}
    {editing && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setEditing(null)}><form onSubmit={save} className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="edit-activity-title"><div className="flex items-start justify-between gap-4"><div><h2 id="edit-activity-title" className="text-xl font-black text-foreground">Editar atividade</h2><p className="mt-1 text-sm text-muted-foreground">Atualize os dados desta atividade.</p></div><button type="button" onClick={() => setEditing(null)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label="Fechar edição da atividade"><X size={18} /></button></div><div className="mt-6 grid gap-4"><label className="grid gap-1.5 text-sm font-semibold text-foreground">Título<input name="title" required defaultValue={editing.title} className="rounded-xl border border-border bg-background px-3 py-2.5 font-normal" /></label><label className="grid gap-1.5 text-sm font-semibold text-foreground">Descrição<textarea name="description" defaultValue={editing.description ?? ""} className="min-h-24 rounded-xl border border-border bg-background px-3 py-2.5 font-normal" /></label><label className="grid gap-1.5 text-sm font-semibold text-foreground">Prazo<input name="dueDate" type="date" defaultValue={editing.dueDate ? new Date(editing.dueDate).toISOString().slice(0, 10) : ""} className="rounded-xl border border-border bg-background px-3 py-2.5 font-normal" /></label></div>{error && <p className="mt-4 text-sm font-semibold text-destructive">{error}</p>}<div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setEditing(null)} className="rounded-xl border border-border px-4 py-2 text-sm font-bold text-foreground hover:bg-muted">Cancelar</button><button type="submit" disabled={saving} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{saving ? "Salvando..." : "Salvar atividade"}</button></div></form></div>}
  </div>;
}
