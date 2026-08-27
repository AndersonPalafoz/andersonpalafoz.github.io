"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, CheckCircle2, Download, Eye, ExternalLink, TrendingUp, Mic, Square, Loader2, FileText, Video, PartyPopper, Share2, ShieldAlert, Trash2, Target, ClipboardCheck, RotateCcw, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface SpeakingAttempt {
  id: number;
  attemptNumber: number;
  audioResponseUrl: string;
  aiScore: number | null;
  aiFeedback: string | null;
  aiSuggestions: string | null;
  teacherFeedback?: string | null;
  teacherAudioFeedbackUrl?: string | null;
  submittedAt: string;
}

interface MaterialItem {
  id: number;
  title: string;
  description: string | null;
  category: string;
  level: string;
  fileUrl: string | null;
}

interface LessonData {
  id: number;
  title: string;
  description: string | null;
  videoUrl: string | null;
  audioUrl: string | null;
  type: string;
  pedagogy?: {
    learningObjectives: string[];
    evidenceOfLearning: string[];
  };
}

export default function LessonPageClient() {
  const params = useParams();
  const courseId = params.id as string;
  const lessonId = params.lessonId as string;
  const searchParams = useSearchParams();
  const offerId = searchParams.get("offerId");
  const offerQuery = offerId ? `&offerId=${encodeURIComponent(offerId)}` : "";
  const courseContextQuery = offerId ? `?offerId=${encodeURIComponent(offerId)}` : "";

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseAudioUrl, setCourseAudioUrl] = useState<string | null>(null);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [completed, setCompleted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [activePreviewUrl, setActivePreviewUrl] = useState<string | null>(null);
  const [certificateCelebration, setCertificateCelebration] = useState<{ certificateUrl: string; certificateCode?: string | null } | null>(null);
  const [personalNote, setPersonalNote] = useState("");
  const [noteDeletedByAdminAt, setNoteDeletedByAdminAt] = useState<string | null>(null);
  const [noteDeletedByAdminEmail, setNoteDeletedByAdminEmail] = useState<string | null>(null);
  const [savingNote, setSavingNote] = useState(false);
  const [deletingNote, setDeletingNote] = useState(false);
  const [confirmDeleteNote, setConfirmDeleteNote] = useState(false);
  const [listeningCompleted, setListeningCompleted] = useState(false);
  const [savingListening, setSavingListening] = useState(false);

  const [listeningActivity, setListeningActivity] = useState<{ id: number; title: string } | null>(null);
  const [speakingActivity, setSpeakingActivity] = useState<{ id: number; title: string } | null>(null);
  const [speakingHistory, setSpeakingHistory] = useState<SpeakingAttempt[]>([]);
  const [latestFeedback, setLatestFeedback] = useState<(SpeakingAttempt & { previousScore: number | null; improvement: number | null }) | null>(null);
  const [speakingReview, setSpeakingReview] = useState<{ feedback: string | null; audioUrl: string | null } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [savingSpeaking, setSavingSpeaking] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const loadLesson = async () => {
      try {
        setLoadingInitial(true);
        const res = await fetch(`/api/lessons/${lessonId}/detail${courseContextQuery}`);
        if (!res.ok) throw new Error("Não foi possível carregar os dados da aula.");
        const json = await res.json();
        setLesson(json.lesson);
        setCourseTitle(json.course?.title || "Curso Oficial");
        setCourseAudioUrl(json.course?.audioUrl || null);
        setMaterials(json.materials || []);
        setCompleted(json.completed);
        const noteRes = await fetch(`/api/notes?lessonId=${lessonId}${offerQuery}`);
        if (noteRes.ok) {
          const noteJson = await noteRes.json();
          const savedNote = noteJson.note;
          setPersonalNote(savedNote?.note || "");
          setNoteDeletedByAdminAt(savedNote?.deletedByAdminAt || null);
          setNoteDeletedByAdminEmail(savedNote?.deletedByAdminEmail || null);
        }

        const listeningAct = json.activities?.find((a: any) => a.type === "listening");
        if (listeningAct) {
          setListeningActivity(listeningAct);
          const listeningRes = await fetch(`/api/activities/${listeningAct.id}/progress`, { cache: "no-store" });
          if (listeningRes.ok) {
            const listeningJson = await listeningRes.json();
            setListeningCompleted(Boolean(listeningJson.completed));
          }
        }

        const speakingAct = json.activities?.find((a: any) => a.type === "speaking");
        if (speakingAct) {
          setSpeakingActivity(speakingAct);
          const speakingProgress = json.activityProgress?.find((progress: any) => progress.activityId === speakingAct.id);
          if (speakingProgress?.status === "in_progress" && (speakingProgress.teacherFeedback || speakingProgress.teacherAudioFeedbackUrl)) {
            setSpeakingReview({ feedback: speakingProgress.teacherFeedback || null, audioUrl: speakingProgress.teacherAudioFeedbackUrl || null });
          } else {
            setSpeakingReview(null);
          }
          const attRes = await fetch(`/api/speaking/attempts?activityId=${speakingAct.id}`);
          if (attRes.ok) {
            const attJson = await attRes.json();
            setSpeakingHistory(attJson.attempts || []);
            if (attJson.attempts?.[0]) {
              setLatestFeedback({ ...attJson.attempts[0], previousScore: null, improvement: null });
            }
          }
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Não foi possível carregar os dados da aula.");
      } finally {
        setLoadingInitial(false);
      }
    };
    void loadLesson();
  }, [lessonId, courseContextQuery, offerQuery]);

  const savePersonalNote = async () => {
    setSavingNote(true);
    try {
      const response = await fetch("/api/notes", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lessonId: Number(lessonId), offerId: offerId ? Number(offerId) : undefined, note: personalNote }) });
      if (!response.ok) throw new Error("Não foi possível salvar sua anotação.");
      toast.success("Anotação salva para esta aula.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Erro ao salvar anotação."); } finally { setSavingNote(false); }
  };

  const deletePersonalNote = async () => {
    if (deletingNote) return;
    setDeletingNote(true);
    try {
      const response = await fetch(`/api/notes?lessonId=${Number(lessonId)}${offerQuery}`, { method: "DELETE" });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Não foi possível excluir sua anotação.");
      setPersonalNote("");
      setConfirmDeleteNote(false);
      toast.success("Anotação excluída com sucesso.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível excluir sua anotação.");
    } finally {
      setDeletingNote(false);
    }
  };

  const handleToggleComplete = async () => {
    setLoadingProgress(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/progress${courseContextQuery}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });
      const payload = await res.json();
      if (res.ok) {
        setCompleted(!completed);
        toast.success(!completed ? "Aula marcada como concluída com sucesso!" : "Aula marcada como pendente.");
        if (payload.certificate?.certificateUrl) {
          toast.success("Parabéns! 100% concluído: Seu certificado PDF foi emitido automaticamente.");
          setCertificateCelebration(payload.certificate);
        }
      } else {
        toast.error(payload.error || "Erro ao atualizar progresso da aula.");
      }
    } catch {
      toast.error("Erro de conexão com o servidor.");
    } finally {
      setLoadingProgress(false);
    }
  };

  const updateListeningProgress = async (completed: boolean) => {
    if (!listeningActivity) {
      toast.error("Nenhuma atividade de Listening vinculada a esta aula.");
      return;
    }
    setSavingListening(true);
    try {
      const response = await fetch(`/api/activities/${listeningActivity.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Não foi possível atualizar o Listening.");
      setListeningCompleted(completed);
      if (completed) {
        toast.success("Parabéns! Atividade de Listening concluída.", {
          action: {
            label: "Desfazer",
            onClick: () => {
              void updateListeningProgress(false);
            },
          },
        });
      } else {
        toast.success("Conclusão do Listening desfeita.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar a atividade de Listening.");
    } finally {
      setSavingListening(false);
    }
  };

  const submitSpeakingAudio = async (file: File) => {
    if (!speakingActivity) {
      toast.error("Nenhuma atividade de Speaking vinculada a esta aula.");
      return;
    }
    setSavingSpeaking(true);
    try {
      const formData = new FormData();
      formData.append("activityId", String(speakingActivity.id));
      formData.append("audio", file);
      const res = await fetch("/api/speaking/attempts", { method: "POST", body: formData });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Erro ao salvar gravação.");
      const previousScore = payload.comparison?.previousScore ?? null;
      const improvement = payload.comparison?.improvement ?? null;
      setSpeakingHistory((current) => [payload.attempt, ...current]);
      setLatestFeedback({ ...payload.attempt, previousScore, improvement });
      setSpeakingReview(null);
      toast.success(previousScore === null ? "Speaking concluído e gravação enviada." : "Regravação de Speaking salva e comparada.", {
        action: {
          label: "Desfazer",
          onClick: () => {
            void undoSpeakingCompletion();
          },
        },
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao enviar áudio.");
    } finally {
      setSavingSpeaking(false);
    }
  };

  const undoSpeakingCompletion = async () => {
    if (!speakingActivity || savingSpeaking) return;
    setSavingSpeaking(true);
    try {
      const response = await fetch(`/api/activities/${speakingActivity.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: false }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Não foi possível desfazer a conclusão de Speaking.");
      toast.success("Conclusão do Speaking desfeita. O histórico da gravação foi preservado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao desfazer a conclusão de Speaking.");
    } finally {
      setSavingSpeaking(false);
    }
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Seu navegador não suporta gravação de áudio.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        void submitSpeakingAudio(new File([blob], `speaking-${Date.now()}.webm`, { type: blob.type }));
        recorderRef.current = null;
      };
      recorder.start();
      recorderRef.current = recorder;
      setIsRecording(true);
      toast.success("Gravando... Fale sua resposta e clique em finalizar.");
    } catch {
      toast.error("Não foi possível acessar o microfone.");
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setIsRecording(false);
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-red-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/cursos/${courseId}${courseContextQuery}`} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold transition">
            <ChevronLeft size={20} /> Voltar ao Curso ({courseTitle})
          </Link>
          <span className="text-xs font-mono font-bold text-gray-400">Aula #{lessonId}</span>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="bg-black rounded-3xl overflow-hidden aspect-video flex items-center justify-center border border-gray-200 shadow-lg relative">
          {lesson?.videoUrl ? (
            <iframe src={lesson.videoUrl.includes("youtube.com") || lesson.videoUrl.includes("youtu.be") ? lesson.videoUrl.replace("watch?v=", "embed/") : lesson.videoUrl} className="w-full h-full border-0" title={lesson.title} allowFullScreen />
          ) : (
            <div className="text-center space-y-2 px-6">
              <Video size={48} className="mx-auto text-red-500 animate-pulse" />
              <p className="text-sm font-bold text-white">Player Multimídia da Aula</p>
              <p className="text-xs text-gray-400">Esta aula foca em conteúdo dinâmico e materiais interativos.</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-600">{lesson?.type || "Aula Prática"}</span>
              <h1 className="text-2xl font-extrabold text-gray-900 mt-1">{lesson?.title || "Aula"}</h1>
              <p className="text-sm text-gray-500 mt-1">Plataforma Acadêmica Anderson Palafoz</p>
            </div>
            <Button onClick={handleToggleComplete} disabled={loadingProgress} className={`gap-2 font-bold h-12 px-6 rounded-xl ${completed ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}`}>
              <CheckCircle2 size={18} />
              {completed ? "Aula Concluída" : "Marcar como Concluída"}
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-900">Descrição & Orientações da Aula</h3>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
              {lesson?.description || "Acompanhe os materiais de apoio e participe das atividades práticas para fixar o conteúdo desta unidade."}
            </p>
          </div>

          {lesson?.pedagogy && (lesson.pedagogy.learningObjectives.length > 0 || lesson.pedagogy.evidenceOfLearning.length > 0) && (
            <section className="rounded-2xl border border-red-100 bg-red-50/50 p-5 dark:border-red-900/60 dark:bg-red-950/20" aria-labelledby="lesson-pedagogy-title">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2"><Target size={19} className="text-red-600" /><h2 id="lesson-pedagogy-title" className="font-bold text-gray-900 dark:text-white">Roteiro de aprendizagem</h2></div>
                <p className="text-xs font-medium text-gray-500 dark:text-slate-400">Use este roteiro para orientar sua prática.</p>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {lesson.pedagogy.learningObjectives.length > 0 && <div className="rounded-xl bg-white/80 p-4 dark:bg-slate-950/60"><h3 className="flex items-center gap-2 text-sm font-bold text-red-700 dark:text-red-200"><Target size={16} /> Ao concluir esta aula, você poderá</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-gray-700 dark:text-slate-200">{lesson.pedagogy.learningObjectives.map((objective, index) => <li key={`${objective}-${index}`} className="flex gap-2"><span aria-hidden="true" className="text-red-600">•</span><span>{objective}</span></li>)}</ul></div>}
                {lesson.pedagogy.evidenceOfLearning.length > 0 && <div className="rounded-xl bg-white/80 p-4 dark:bg-slate-950/60"><h3 className="flex items-center gap-2 text-sm font-bold text-red-700 dark:text-red-200"><ClipboardCheck size={16} /> Como demonstrar sua aprendizagem</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-gray-700 dark:text-slate-200">{lesson.pedagogy.evidenceOfLearning.map((evidence, index) => <li key={`${evidence}-${index}`} className="flex gap-2"><span aria-hidden="true" className="text-red-600">•</span><span>{evidence}</span></li>)}</ul></div>}
              </div>
            </section>
          )}

          <div className="border-t border-gray-100 pt-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold text-base text-gray-900">Minhas anotações</h3><span className="text-xs font-semibold text-gray-500">Salvas por aula</span></div>
            {noteDeletedByAdminAt ? (
              <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><ShieldAlert size={18} className="mt-0.5 shrink-0" /><p>Esta anotação foi excluída por um administrador{noteDeletedByAdminEmail ? ` (${noteDeletedByAdminEmail})` : ""} em {new Date(noteDeletedByAdminAt).toLocaleString("pt-BR")}. O conteúdo original não pode mais ser editado.</p></div>
            ) : (
              <><textarea value={personalNote} onChange={(event) => setPersonalNote(event.target.value)} placeholder="Registre vocabulário, dúvidas e observações importantes..." className="min-h-28 w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 outline-none focus:border-red-500" /><div className="flex flex-wrap gap-2"><Button onClick={savePersonalNote} disabled={savingNote || deletingNote} variant="outline" className="gap-2 rounded-xl border-gray-300 font-bold">{savingNote && <Loader2 className="animate-spin" size={16} />} Salvar anotação</Button>{personalNote.trim() && <Button onClick={() => setConfirmDeleteNote(true)} disabled={savingNote || deletingNote} variant="outline" className="gap-2 rounded-xl border-red-200 font-bold text-red-600 hover:bg-red-50">{deletingNote ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />} Excluir anotação</Button>}</div></>
            )}
          </div>

          <div className="border-t border-gray-100 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-gray-900">Materiais Complementares da Aula ({materials.length})</h3>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">Oficiais</span>
            </div>
            {materials.length === 0 ? (
              <p className="text-xs text-gray-500 py-3">Nenhum material extra anexado a esta aula ainda.</p>
            ) : (
              <div className="grid gap-3">
                {materials.map((mat) => (
                  <div key={mat.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900">{mat.title}</p>
                        <p className="text-xs text-gray-500">{mat.category} • Nível {mat.level}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {mat.fileUrl && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => setActivePreviewUrl(activePreviewUrl === mat.fileUrl ? null : mat.fileUrl)} className="border-gray-300 font-semibold gap-1.5">
                            <Eye size={14} /> {activePreviewUrl === mat.fileUrl ? "Ocultar" : "Visualizar"}
                          </Button>
                          <a href={mat.fileUrl} download target="_blank" rel="noopener noreferrer">
                            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-semibold gap-1.5"><Download size={14} /> Baixar</Button>
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {activePreviewUrl && (
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="text-xs font-bold text-gray-700 uppercase">Visualizador Integrado</span>
                      <a href={activePreviewUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-red-600 hover:underline flex items-center gap-1">Abrir em nova aba <ExternalLink size={12} /></a>
                    </div>
                    <div className="w-full h-96 rounded-xl border border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                      <iframe src={activePreviewUrl} className="w-full h-full" title="Visualizador" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-6 space-y-6">
            <h3 className="font-bold text-lg text-gray-900">Atividades Práticas (Listening & Speaking)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/25 border border-red-200 dark:border-red-900/70 space-y-4">
                <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-200 bg-white dark:bg-black/20 px-3 py-1 rounded-full shadow-xs">Compreensão Auditiva</span><span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Listening Exercise</span></div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100 text-base">Ouça o áudio de referência</h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">Pratique a escuta ativa acompanhando o diálogo principal da aula.</p>
                {(lesson?.audioUrl || courseAudioUrl) ? (
                  <>
                    <audio controls preload="metadata" src={lesson?.audioUrl || courseAudioUrl || undefined} className="w-full" aria-label={`Áudio de listening da aula ${lesson?.title || lessonId}`} />
                    <Button
                      onClick={() => void updateListeningProgress(!listeningCompleted)}
                      disabled={savingListening || !listeningActivity}
                      className={`w-full gap-2 rounded-xl font-bold text-xs ${listeningCompleted ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}`}
                      aria-pressed={listeningCompleted}
                    >
                      {savingListening ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                      {listeningCompleted ? "Desfazer conclusão do Listening" : "Marcar Listening como Concluído"}
                    </Button>
                  </>
                ) : (
                  <div className="rounded-xl border border-dashed border-red-200 dark:border-red-900/70 bg-white/70 dark:bg-black/20 px-4 py-3 text-xs text-gray-600 dark:text-gray-300">
                    O áudio de listening ainda não foi vinculado a esta aula.
                  </div>
                )}
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 space-y-4">
                <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-white px-3 py-1 rounded-full shadow-xs">Prática de Pronúncia</span><span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">Speaking Ativo</span></div>
                <h4 className="font-bold text-gray-900 text-base">Grave sua voz e acompanhe suas tentativas</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{speakingActivity ? speakingActivity.title : "Atividade de conversação guiada."}</p>
                <div className="pt-2 space-y-3">
                  {speakingReview && (
                    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/35 dark:text-amber-100" role="status">
                      <div className="flex items-center gap-2 font-bold"><RotateCcw size={17} className="text-amber-700 dark:text-amber-300" /> Nova tentativa orientada</div>
                      <p className="mt-2 text-xs leading-5">{speakingReview.feedback || "Seu professor solicitou uma nova tentativa. Revise a orientação recebida e grave uma resposta atualizada."}</p>
                      {speakingReview.audioUrl && <audio controls src={speakingReview.audioUrl} className="mt-3 h-8 w-full" aria-label="Orientação em áudio do professor" />}
                      <p className="mt-2 text-xs font-semibold">Sua tentativa anterior e a devolutiva continuam preservadas no histórico.</p>
                    </div>
                  )}
                  <Button disabled={!speakingActivity || savingSpeaking} onClick={isRecording ? stopRecording : startRecording} className={`w-full py-3 rounded-xl text-white font-bold text-xs ${isRecording ? "bg-gray-900 hover:bg-black" : "bg-blue-600 hover:bg-blue-700"}`}>
                    {savingSpeaking ? <><Loader2 size={14} className="mr-2 animate-spin" /> Salvando...</> : isRecording ? <><Square size={14} className="mr-2" /> Parar gravação</> : <><Mic size={14} className="mr-2" /> {speakingReview ? "Enviar nova tentativa orientada" : speakingHistory.length > 0 ? "Regravar e comparar evolução" : "Gravar tentativa"}</>}
                  </Button>
                  <label className="block rounded-xl border border-dashed border-blue-200 bg-white/70 p-3 text-xs text-gray-600">Enviar arquivo de áudio
                    <input type="file" accept="audio/*" disabled={!speakingActivity || savingSpeaking} onChange={(e) => { const f = e.target.files?.[0]; if (f) void submitSpeakingAudio(f); e.currentTarget.value = ""; }} className="mt-2 block w-full text-xs file:mr-3 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white" />
                  </label>

                  {latestFeedback && <div className="p-4 rounded-xl bg-white border border-blue-200 space-y-2 animate-fadeIn"><div className="flex items-center justify-between"><span className="text-xs font-bold text-blue-700">Resultado da tentativa</span><span className="text-xs font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">{latestFeedback.aiScore ?? "—"}/100</span></div><p className="flex items-start gap-2 text-xs font-semibold text-red-600"><MessageSquare size={14} className="mt-0.5 shrink-0" /><span>{latestFeedback.teacherFeedback || latestFeedback.aiFeedback}</span></p>{latestFeedback.teacherAudioFeedbackUrl && <audio controls src={latestFeedback.teacherAudioFeedbackUrl} className="h-8 w-full" aria-label="Feedback em áudio do professor" />}{latestFeedback.improvement !== null && <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700"><TrendingUp size={14} /><span>{latestFeedback.improvement >= 0 ? "+" : ""}{latestFeedback.improvement} pontos vs tentativa anterior.</span></div>}</div>}

                  {speakingHistory.length > 0 && <div className="pt-2 border-t border-blue-100"><p className="text-xs font-bold text-gray-700 mb-2">Histórico ({speakingHistory.length})</p><div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">{speakingHistory.map((item) => <div key={item.id} className="flex items-center justify-between bg-white p-2 rounded-lg text-xs border border-blue-100"><span className="font-semibold text-gray-700">Tentativa #{item.attemptNumber}</span><div className="flex items-center gap-2">{item.audioResponseUrl && <audio controls src={item.audioResponseUrl} className="h-6 max-w-[120px]" />}<span className="font-bold text-blue-600">{item.aiScore ?? "—"} pts</span></div></div>)}</div></div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDeleteNote}
        title="Excluir anotação desta aula?"
        description="A anotação será removida da sua conta. O progresso da aula, atividades e certificado não serão alterados."
        busy={deletingNote}
        onCancel={() => { if (!deletingNote) setConfirmDeleteNote(false); }}
        onConfirm={() => void deletePersonalNote()}
      />
      {certificateCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="certificate-celebration-title">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-red-200 bg-white p-8 text-center shadow-2xl animate-in fade-in zoom-in-95">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-red-600 via-amber-400 to-red-600" />
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-600 animate-bounce"><PartyPopper size={42} /></div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Conquista desbloqueada</p>
            <h2 id="certificate-celebration-title" className="mt-2 text-3xl font-black text-gray-950">Parabéns! Curso concluído.</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">Seu certificado foi gerado automaticamente e já está disponível para download.</p>
            {certificateCelebration.certificateCode && <p className="mt-3 rounded-xl bg-gray-50 px-3 py-2 font-mono text-xs font-bold text-gray-600">Código: {certificateCelebration.certificateCode}</p>}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <a href={certificateCelebration.certificateUrl} download target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-red-600/25 transition hover:bg-red-700"><Download size={18} /> Baixar certificado PDF</a>
              <button onClick={() => { const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certificateCelebration.certificateUrl)}`; window.open(shareUrl, "_blank", "noopener,noreferrer"); }} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0A66C2] bg-[#0A66C2] px-5 py-3.5 text-sm font-black text-white transition hover:bg-[#084d91]"><Share2 size={18} /> Compartilhar no LinkedIn</button>
            </div>
            <button onClick={() => setCertificateCelebration(null)} className="mt-5 text-sm font-bold text-gray-500 underline-offset-4 hover:text-gray-900 hover:underline">Continuar estudando</button>
          </div>
        </div>
      )}
    </div>
  );
}
