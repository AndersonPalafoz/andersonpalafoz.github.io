"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Info, Loader2, Mic, Square, Volume2 } from "lucide-react";

type SpeakingActivity = { id: number; courseId: number; title: string; description: string | null };

export default function SpeakingPracticePage() {
  const [activities, setActivities] = useState<SpeakingActivity[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/dashboard/speaking-practice", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Não foi possível carregar as atividades.");
        if (!cancelled) { setActivities(payload.activities || []); setSelectedId(payload.activities?.[0]?.id ?? null); }
      })
      .catch(() => { if (!cancelled) setActivities([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const selected = activities.find((activity) => activity.id === selectedId) || null;

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    recorder.ondataavailable = (event) => { if (event.data.size > 0) chunksRef.current.push(event.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
      setAudioUrl(URL.createObjectURL(blob));
      stream.getTracks().forEach((track) => track.stop());
    };
    mediaRecorderRef.current = recorder;
    recorder.start();
    setAudioUrl(null);
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10 font-sans">
      <header><Link href="/dashboard" className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:underline"><ArrowLeft size={14} /> Voltar ao dashboard</Link><h1 className="mt-3 text-3xl font-black text-foreground">Prática de speaking</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Escolha uma atividade de speaking cadastrada nos seus cursos e grave uma prévia para revisão. Esta página não atribui notas nem simula envio ao professor.</p></header>

      {loading ? <div className="surface-card flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground"><Loader2 className="animate-spin" size={18} /> Consultando atividades reais…</div> : activities.length === 0 ? <div className="surface-card border-dashed p-10 text-center"><Info className="mx-auto text-muted-foreground" size={26} /><h2 className="mt-4 text-lg font-black text-foreground">Nenhuma atividade de speaking encontrada</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">Não há uma atividade do tipo speaking cadastrada em uma turma em que sua conta esteja matriculada. A página não cria frases ou atividades de exemplo.</p></div> : <section className="surface-card space-y-6 p-6 sm:p-8"><div><label htmlFor="speaking-activity" className="mb-2 block text-xs font-black uppercase tracking-wider text-muted-foreground">Atividade cadastrada</label><select id="speaking-activity" value={selectedId ?? ""} onChange={(event) => setSelectedId(Number(event.target.value))} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-bold text-foreground">{activities.map((activity) => <option key={activity.id} value={activity.id}>{activity.title}</option>)}</select></div>{selected && <div className="rounded-2xl border border-border bg-muted/30 p-4"><div className="flex items-start gap-3"><Volume2 className="mt-0.5 shrink-0 text-red-600" size={20} /><div><p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Orientação da atividade</p><p className="mt-1 text-sm font-semibold leading-6 text-foreground">{selected.description || "Esta atividade não possui orientação textual cadastrada."}</p></div></div></div>}<div className="flex flex-col items-center justify-center space-y-4 rounded-3xl border border-dashed border-border bg-muted/30 p-8"><button type="button" onClick={isRecording ? stopRecording : () => void startRecording()} className={`flex h-20 w-20 items-center justify-center rounded-full text-white shadow-xl transition ${isRecording ? "animate-pulse bg-amber-600 hover:bg-amber-700" : "bg-red-600 hover:scale-105 hover:bg-red-700"}`} aria-label={isRecording ? "Parar gravação" : "Iniciar gravação"}>{isRecording ? <Square size={28} /> : <Mic size={32} />}</button><p className="text-center text-xs font-black text-foreground">{isRecording ? "Gravando… clique para parar" : audioUrl ? "Prévia local pronta" : "Clique para gravar uma prévia"}</p>{audioUrl && <audio controls src={audioUrl} className="w-full max-w-md" />}<p className="text-center text-[11px] leading-5 text-muted-foreground">A gravação permanece apenas nesta página e não é considerada enviada, avaliada ou salva no banco.</p></div></section>}
    </div>
  );
}
