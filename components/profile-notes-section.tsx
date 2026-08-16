"use client";

import { useEffect, useState } from "react";
import { StickyNote, Clock, Trash2, Printer, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createTablePdf, downloadPdf } from "@/lib/pdf-export";

interface NoteItem {
  id: string;
  time: number;
  timeFormatted: string;
  text: string;
  mediaKey: string;
}

export function ProfileNotesSection() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const allNotes: NoteItem[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("media_notes_")) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              allNotes.push(...parsed.map((n: NoteItem) => ({ ...n, mediaKey: key.replace("media_notes_", "") })));
            }
          }
        }
      }
      setNotes(allNotes);
    } catch {
      // Ignorado
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = (id: string, mediaKey: string) => {
    try {
      const storageKey = `media_notes_${mediaKey}`;
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as NoteItem[];
        const filtered = parsed.filter((n) => n.id !== id);
        localStorage.setItem(storageKey, JSON.stringify(filtered));
        setNotes((current) => current.filter((n) => n.id !== id));
        toast.success("Nota removida com sucesso.");
      }
    } catch {
      toast.error("Erro ao remover nota.");
    }
  };

  const handleExportPDF = async () => {
    if (notes.length === 0) {
      toast.error("Nenhuma anotação encontrada para exportar.");
      return;
    }

    try {
      const bytes = await createTablePdf(
        "Minhas Anotações de Aulas — Anderson Palafoz",
        ["Momento", "Anotação", "Mídia / Aula"],
        notes.map((n) => [n.timeFormatted, n.text, n.mediaKey.slice(0, 16) + "..."])
      );
      downloadPdf(bytes, `minhas-anotacoes-${Date.now()}.pdf`);
      toast.success("Anotações exportadas em PDF com sucesso!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao gerar PDF de anotações.");
    }
  };

  if (loading) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-red-600" size={28} />
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl border border-border bg-card space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <StickyNote className="text-red-600" size={20} />
          <h3 className="font-bold text-foreground text-base">Minhas Anotações de Aulas e Vídeos</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => void handleExportPDF()} variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-bold border-border">
            <Printer size={13} /> Exportar PDF
          </Button>
          <span className="text-xs font-bold bg-muted px-3 py-1 rounded-full text-muted-foreground">{notes.length} nota(s)</span>
        </div>
      </div>

      {notes.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Você ainda não salvou nenhuma anotação nas aulas assistidas.</p>
      ) : (
        <div className="space-y-3">
          {notes.map((n) => (
            <div key={n.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border/70 bg-muted/30">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-red-100 text-red-700 text-xs font-bold">
                    <Clock size={12} /> {n.timeFormatted}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">Aula ID: {n.mediaKey.slice(0, 8)}</span>
                </div>
                <p className="text-sm font-semibold text-foreground">{n.text}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(n.id, n.mediaKey)}
                className="h-8 px-2.5 text-xs text-red-600 border-red-200 hover:bg-red-50 gap-1 shrink-0"
              >
                <Trash2 size={13} /> Excluir
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
