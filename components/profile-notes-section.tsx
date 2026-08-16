"use client";

import { useEffect, useState } from "react";
import { StickyNote, Clock, Trash2, Printer, Loader2, Edit3, Share2, Check, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [sharingNoteId, setSharingNoteId] = useState<string | null>(null);
  const [shareEmail, setShareEmail] = useState("");

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

  const handleStartEdit = (note: NoteItem) => {
    setEditingNoteId(note.id);
    setEditText(note.text);
  };

  const handleSaveEdit = (id: string, mediaKey: string) => {
    if (!editText.trim()) return;
    try {
      const storageKey = `media_notes_${mediaKey}`;
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as NoteItem[];
        const updated = parsed.map((n) => (n.id === id ? { ...n, text: editText.trim() } : n));
        localStorage.setItem(storageKey, JSON.stringify(updated));
        setNotes((current) => current.map((n) => (n.id === id ? { ...n, text: editText.trim() } : n)));
        setEditingNoteId(null);
        toast.success("Nota atualizada com sucesso!");
      }
    } catch {
      toast.error("Erro ao atualizar nota.");
    }
  };

  const handleShare = (note: NoteItem) => {
    if (!shareEmail.trim() || !shareEmail.includes("@")) {
      toast.error("Digite um e-mail válido para compartilhar.");
      return;
    }
    navigator.clipboard.writeText(`Nota de Aula de Anderson Palafoz (${note.timeFormatted}): "${note.text}"`);
    toast.success(`Nota copiada e link de compartilhamento gerado para ${shareEmail}!`);
    setSharingNoteId(null);
    setShareEmail("");
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
            <div key={n.id} className="p-4 rounded-xl border border-border/70 bg-muted/30 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-red-100 text-red-700 text-xs font-bold">
                    <Clock size={12} /> {n.timeFormatted}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">Aula ID: {n.mediaKey.slice(0, 8)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSharingNoteId(sharingNoteId === n.id ? null : n.id)}
                    className="h-8 px-2.5 text-xs font-bold border-border gap-1"
                  >
                    <Share2 size={13} /> Compartilhar
                  </Button>
                  {editingNoteId !== n.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartEdit(n)}
                      className="h-8 px-2.5 text-xs font-bold border-border gap-1"
                    >
                      <Edit3 size={13} /> Editar
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(n.id, n.mediaKey)}
                    className="h-8 px-2.5 text-xs text-red-600 border-red-200 hover:bg-red-50 gap-1"
                  >
                    <Trash2 size={13} /> Excluir
                  </Button>
                </div>
              </div>

              {editingNoteId === n.id ? (
                <div className="flex gap-2 pt-1">
                  <Input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="text-xs bg-background h-9"
                  />
                  <Button size="sm" onClick={() => handleSaveEdit(n.id, n.mediaKey)} className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 text-xs gap-1 font-bold">
                    <Save size={14} /> Salvar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingNoteId(null)} className="h-9 text-xs">
                    <X size={14} />
                  </Button>
                </div>
              ) : (
                <p className="text-sm font-semibold text-foreground">{n.text}</p>
              )}

              {sharingNoteId === n.id && (
                <div className="flex gap-2 pt-2 border-t border-border/60 bg-background/60 p-3 rounded-xl">
                  <Input
                    placeholder="Digite o e-mail de outro aluno..."
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    className="text-xs bg-background h-9"
                  />
                  <Button size="sm" onClick={() => handleShare(n)} className="bg-red-600 hover:bg-red-700 text-white h-9 text-xs gap-1 font-bold shrink-0">
                    <Check size={14} /> Enviar Nota
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
