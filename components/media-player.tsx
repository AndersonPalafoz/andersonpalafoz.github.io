"use client";

import { useEffect, useRef, useState } from "react";
import { Headphones, Video, Gauge, CheckCircle2, StickyNote, Plus, Trash2, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MediaPlayerProps { type: "audio" | "video"; url: string; title?: string; mediaKey?: string; lessonId?: number; onCompleteLesson?: (lessonId: number) => void; }
interface NoteItem { id: string; time: number; timeFormatted: string; text: string; }
const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5, 2];

export function MediaPlayer({ type, url, title, lessonId, onCompleteLesson }: MediaPlayerProps) {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const [speed, setSpeed] = useState(1);
  const [ended, setEnded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [notesLoading, setNotesLoading] = useState(Boolean(lessonId));
  const [notesSaving, setNotesSaving] = useState(false);

  useEffect(() => {
    if (!lessonId) { setNotesLoading(false); return; }
    let cancelled = false;
    fetch(`/api/media-notes?lessonId=${lessonId}`, { cache: "no-store" })
      .then(async (response) => { const payload = await response.json(); if (!response.ok) throw new Error(payload.error || "Não foi possível carregar as anotações."); if (!cancelled) setNotes(payload.notes || []); })
      .catch(() => { if (!cancelled) toast.error("Não foi possível carregar as anotações persistidas."); })
      .finally(() => { if (!cancelled) setNotesLoading(false); });
    return () => { cancelled = true; };
  }, [lessonId]);

  const handleTimeUpdate = () => { if (mediaRef.current) setCurrentTime(mediaRef.current.currentTime); };
  const handleEnded = () => { setEnded(true); if (lessonId && onCompleteLesson) onCompleteLesson(lessonId); };
  const changeSpeed = (newSpeed: number) => { setSpeed(newSpeed); if (mediaRef.current) mediaRef.current.playbackRate = newSpeed; };
  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;

  const handleAddNote = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!lessonId) { toast.error("Esta mídia não está vinculada a uma aula persistível."); return; }
    if (!newNoteText.trim()) return;
    setNotesSaving(true);
    try {
      const response = await fetch("/api/media-notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lessonId, time: currentTime, text: newNoteText.trim() }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Não foi possível salvar a anotação.");
      setNotes((current) => [...current, payload.note]);
      setNewNoteText("");
      toast.success("Anotação salva no banco de dados.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível salvar a anotação."); }
    finally { setNotesSaving(false); }
  };

  const handleDeleteNote = async (id: string) => {
    if (!lessonId) return;
    const response = await fetch("/api/media-notes", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lessonId, id }) });
    if (!response.ok) { toast.error("Não foi possível remover a anotação."); return; }
    setNotes((current) => current.filter((note) => note.id !== id));
    toast.info("Anotação removida do banco de dados.");
  };
  const handleJumpToNote = (time: number) => { if (mediaRef.current) { mediaRef.current.currentTime = time; void mediaRef.current.play(); } };
  if (!url) return null;
  const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");

  return <div className="surface-card my-6 space-y-4 overflow-hidden p-4 sm:p-6"><div className="flex flex-col justify-between gap-2 border-b border-border/60 pb-3 sm:flex-row sm:items-center"><div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-600">{type === "video" ? <Video size={16} /> : <Headphones size={16} />}{title || (type === "video" ? "Vídeo Complementar / Aula" : "Áudio / Listening")}</div>{!isYouTube && <div className="flex items-center gap-1 rounded-lg bg-muted px-2 py-1 text-xs font-semibold"><Gauge size={13} className="text-muted-foreground" />{PLAYBACK_SPEEDS.map((value) => <button key={value} onClick={() => changeSpeed(value)} className={`rounded px-1.5 py-0.5 ${speed === value ? "bg-red-600 font-bold text-white" : "text-muted-foreground hover:text-foreground"}`}>{value}x</button>)}</div>}</div>{type === "video" ? (isYouTube ? <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black"><iframe src={url.includes("embed") ? url : url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")} title={title || "Vídeo"} className="absolute inset-0 h-full w-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div> : <video ref={mediaRef as React.RefObject<HTMLVideoElement>} onTimeUpdate={handleTimeUpdate} onEnded={handleEnded} controls className="w-full rounded-xl bg-black shadow-md" src={url}>Seu navegador não suporta a tag de vídeo.</video>) : <audio ref={mediaRef as React.RefObject<HTMLAudioElement>} onTimeUpdate={handleTimeUpdate} onEnded={handleEnded} controls className="w-full" src={url}>Seu navegador não suporta a tag de áudio.</audio>}{ended && lessonId && onCompleteLesson && <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-3"><span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800"><CheckCircle2 size={16} /> Mídia concluída.</span><Button size="sm" onClick={() => onCompleteLesson(lessonId)} className="h-8 bg-emerald-600 text-xs text-white hover:bg-emerald-700">Confirmar conclusão</Button></div>}<div className="space-y-3 border-t border-border/60 pt-4"><div className="flex items-center justify-between"><h4 className="flex items-center gap-1.5 text-xs font-bold uppercase text-foreground"><StickyNote size={15} className="text-red-600" /> Anotações persistidas ({notes.length})</h4><span className="font-mono text-xs text-muted-foreground">Atual: {formatTime(currentTime)}</span></div>{!lessonId ? <p className="rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground">Esta mídia não está vinculada a uma aula e não pode receber anotações persistidas.</p> : <><form onSubmit={(event) => void handleAddNote(event)} className="flex gap-2"><Input placeholder="Escreva uma nota neste momento…" value={newNoteText} onChange={(event) => setNewNoteText(event.target.value)} className="h-9 bg-background text-xs" /><Button type="submit" size="sm" disabled={notesSaving} className="h-9 shrink-0 gap-1 bg-red-600 text-xs font-bold text-white hover:bg-red-700">{notesSaving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Salvar</Button></form>{notesLoading ? <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 size={14} className="animate-spin" /> Carregando registros persistidos…</div> : notes.length > 0 && <div className="max-h-48 space-y-2 overflow-y-auto pr-1">{notes.map((note) => <div key={note.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/40 p-2.5 text-xs"><div className="flex min-w-0 items-center gap-2.5"><button type="button" onClick={() => handleJumpToNote(note.time)} className="inline-flex shrink-0 items-center gap-1 rounded bg-red-100 px-2 py-1 font-bold text-red-700 hover:bg-red-200"><Clock size={12} /> {note.timeFormatted}</button><span className="truncate font-medium text-foreground">{note.text}</span></div><button type="button" onClick={() => void handleDeleteNote(note.id)} className="shrink-0 p-1 text-muted-foreground hover:text-red-600" title="Excluir nota"><Trash2 size={14} /></button></div>)}</div>}</>}</div></div>;
}
