"use client";

import { useEffect, useState } from "react";
import { BookOpen, Clock, Inbox, Loader2, StickyNote } from "lucide-react";

interface LessonNote {
  id: number;
  lessonId: number;
  note: string;
  lessonTitle: string;
  createdAt: string;
  updatedAt: string;
  deletedByAdminAt: string | null;
  deletedByAdminEmail: string | null;
}

export function ProfileNotesSection() {
  const [notes, setNotes] = useState<LessonNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/dashboard/notes", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Não foi possível carregar as anotações.");
        if (!cancelled) setNotes(payload.notes || []);
      })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="surface-card flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground"><Loader2 className="animate-spin" size={18} /> Consultando anotações persistidas…</div>;
  if (error) return <div className="surface-card p-8 text-sm text-muted-foreground">Não foi possível consultar suas anotações de aulas.</div>;

  return (
    <section className="surface-card space-y-5 p-6 sm:p-8" aria-labelledby="notes-title">
      <div className="flex flex-col gap-3 border-b border-border/70 pb-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2"><StickyNote className="text-red-600" size={20} /><div><h2 id="notes-title" className="text-base font-black text-foreground">Anotações de aulas</h2><p className="mt-1 text-xs text-muted-foreground">Somente registros persistidos na sua conta.</p></div></div><span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">{notes.length} registro(s)</span></div>
      {notes.length === 0 ? <div className="rounded-2xl border border-dashed border-border p-8 text-center"><Inbox className="mx-auto text-muted-foreground" size={25} /><p className="mt-3 text-sm font-bold text-foreground">Nenhuma anotação persistida.</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Anotações salvas em outro dispositivo ou apenas no navegador não são exibidas aqui, pois não são dados confirmados no banco.</p></div> : <div className="space-y-3">{notes.map((note) => <article key={note.id} className="rounded-2xl border border-border/70 bg-muted/20 p-4"><div className="flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700 dark:bg-red-950/50 dark:text-red-300"><BookOpen size={12} /> {note.lessonTitle}</span><span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"><Clock size={12} /> Atualizada em {new Date(note.updatedAt).toLocaleDateString("pt-BR")}</span></div>{note.deletedByAdminAt ? <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold leading-5 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">Excluído por um administrador{note.deletedByAdminEmail ? ` (${note.deletedByAdminEmail})` : ""} em {new Date(note.deletedByAdminAt).toLocaleString("pt-BR")}.</p> : <p className="mt-3 text-sm font-semibold leading-6 text-foreground">{note.note}</p>}</article>)}</div>}
    </section>
  );
}
