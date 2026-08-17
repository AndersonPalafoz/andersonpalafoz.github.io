'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Mic, Clock, Filter, Volume2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function ProfessorProgressSpeakingPage() {
  const [data, setData] = useState<{ students: any[]; lessonProgress: any[]; activityProgress: any[]; speakingAttempts?: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const [scoreVal, setScoreVal] = useState<number>(85);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackAudio, setFeedbackAudio] = useState<File | null>(null);
  const [feedbackFilter, setFeedbackFilter] = useState<"all" | "pending" | "reviewed">("all");
  const [dateSort, setDateSort] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch("/api/professor/progress-speaking");
        if (!res.ok) throw new Error("Erro ao carregar dados");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error loading progress & speaking:", err);
        toast.error("Não foi possível carregar os dados de progresso.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleEvaluate = async (activityProgressId: string) => {
    try {
      const payload = new FormData();
      payload.append("activityProgressId", activityProgressId);
      if (selectedAttemptId) payload.append("attemptId", selectedAttemptId);
      payload.append("score", String(scoreVal));
      payload.append("teacherFeedback", feedbackText);
      if (feedbackAudio) payload.append("teacherAudio", feedbackAudio);

      const res = await fetch("/api/professor/progress-speaking", {
        method: "POST",
        body: payload
      });

      if (!res.ok) throw new Error("Erro ao salvar avaliação");
      toast.success("Avaliação salva com sucesso pelo professor!");
      setEvaluatingId(null);
      setFeedbackAudio(null);

      const refreshRes = await fetch("/api/professor/progress-speaking");
      if (refreshRes.ok) {
        const json = await refreshRes.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
      toast.error("Falha ao salvar a avaliação.");
    }
  };

  if (loading) {
    return (
      <div className="site-shell flex items-center justify-center p-12" aria-busy="true">
        <div className="surface-card h-64 animate-pulse flex items-center justify-center">
          <p className="text-sm font-bold text-muted-foreground">Carregando painel de progresso...</p>
        </div>
      </div>
    );
  }

  const students = data?.students || [];
  const lessonProgress = data?.lessonProgress || [];
  const activityProgress = data?.activityProgress || [];
  const speakingSubmissions = activityProgress.filter(ap => ap.activity?.type === "speaking" || ap.audioResponseUrl);
  const speakingAttempts = data?.speakingAttempts || [];

  const filteredSpeakingSubmissions = [...speakingSubmissions]
    .filter((sub) => {
      const needsFeedback = !sub.teacherFeedback && !sub.teacherAudioFeedbackUrl;
      return feedbackFilter === "all" || (feedbackFilter === "pending" ? needsFeedback : !needsFeedback);
    })
    .sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return dateSort === "newest" ? timeB - timeA : timeA - timeB;
    });

  return (
    <div className="site-shell px-4 py-8 sm:px-6 lg:px-8">
      <div className="page-container space-y-8">
        <header className="surface-card flex flex-col justify-between gap-4 p-5 sm:p-7 md:flex-row md:items-center">
          <div>
            <Link href="/professor" className="text-sm font-semibold text-red-600 hover:underline flex items-center gap-1 mb-2">
              <ArrowLeft size={16} /> Voltar ao Painel do Professor
            </Link>
            <h1 className="flex items-center gap-3 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              <Mic className="text-red-600" size={32} />
              Progresso de Aulas & Avaliação de Speaking
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
              Acompanhe o andamento das aulas e avalie as gravações de áudio enviadas pelos alunos com feedback personalizado.
            </p>
          </div>
        </header>

        {/* Seção 1: Progresso de Aulas por Aluno */}
        <div className="surface-card space-y-6 p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-xl font-black text-foreground">
            <CheckCircle2 className="text-red-600" size={24} />
            Progresso Geral de Aulas dos Alunos
          </h2>

          {students.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">Nenhum aluno vinculado no momento.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map((student) => {
                const studentLessons = lessonProgress.filter(lp => lp.userId === student.id && lp.completed === 1);
                return (
                  <div key={student.id} className="rounded-2xl border border-border/70 bg-muted/50 p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold">
                        {student.name ? student.name.charAt(0).toUpperCase() : "A"}
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">{student.name || "Aluno"}</h3>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-border/70 pt-3 text-sm">
                      <span className="font-medium text-muted-foreground">Aulas Concluídas:</span>
                      <span className="font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full">
                        {studentLessons.length} aulas
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Seção 2: Submissões de Speaking & Feedback do Professor */}
        <div className="surface-card space-y-6 p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-xl font-black text-foreground">
            <MessageSquare className="text-red-600" size={24} />
            Avaliação de Gravações de Speaking (Feedback Docente)
          </h2>
          <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/50 p-3 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground"><Filter size={14} className="text-red-600" /> Status do feedback
              <select value={feedbackFilter} onChange={(e) => setFeedbackFilter(e.target.value as typeof feedbackFilter)} className="field-control rounded-lg border border-border bg-card px-2 py-1.5 text-xs font-semibold text-foreground">
                <option value="all">Todas</option><option value="pending">Aguardando feedback</option><option value="reviewed">Já avaliadas</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground"><Clock size={14} className="text-red-600" /> Ordenar por data
              <select value={dateSort} onChange={(e) => setDateSort(e.target.value as typeof dateSort)} className="field-control rounded-lg border border-border bg-card px-2 py-1.5 text-xs font-semibold text-foreground">
                <option value="newest">Mais recentes</option><option value="oldest">Mais antigas</option>
              </select>
            </label>
            <span className="ml-auto self-center rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-800">{speakingSubmissions.filter((submission) => !submission.teacherFeedback && !submission.teacherAudioFeedbackUrl).length} aguardando</span>
          </div>

          {filteredSpeakingSubmissions.length === 0 ? (
            <div className="empty-state py-12 text-center">
              <Mic className="mx-auto mb-3 text-muted-foreground" size={36} />
              <p className="font-semibold text-foreground">Nenhuma gravação de speaking enviada pelos alunos ainda.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSpeakingSubmissions.map((sub) => {
                const student = students.find(s => s.id === sub.userId);
                const needsFeedback = !sub.teacherFeedback && !sub.teacherAudioFeedbackUrl;
                const attempts = speakingAttempts.filter((attempt) => attempt.userId === sub.userId && attempt.activityId === sub.activityId);
                return (
                  <div key={sub.id} className={`rounded-2xl border p-5 sm:p-6 space-y-4 ${needsFeedback ? "border-amber-300 bg-amber-50/50 ring-1 ring-amber-200" : "border-border/70 bg-muted/50"}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                            {sub.activity?.title || "Atividade de Speaking"}
                          </span>
                          <span className="text-xs font-medium text-muted-foreground">
                            Aluno: {student?.name || student?.email || `ID ${sub.userId}`}
                          </span>
                          {needsFeedback && <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold uppercase">Aguardando feedback</span>}
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          Status: <span className="uppercase text-red-600">{sub.status}</span> {sub.score ? `• Nota: ${sub.score}/100` : ""}
                        </p>
                      </div>
                      {sub.audioResponseUrl && (
                        <audio controls src={sub.audioResponseUrl} className="h-10 w-full md:w-64" />
                      )}
                    </div>

                    {attempts.length > 0 && (
                      <div className="surface-card space-y-2 p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold uppercase tracking-wide text-info">Histórico de tentativas ({attempts.length})</p>
                          <span className="text-[11px] text-muted-foreground">A mais recente aparece primeiro</span>
                        </div>
                        {attempts.map((attempt: any) => (
                          <div key={attempt.id} className="flex flex-col gap-3 rounded-xl border border-info/20 bg-info/5 p-3 md:flex-row md:items-center">
                            <div className="flex-1">
                              <p className="text-xs font-bold text-foreground">Tentativa #{attempt.attemptNumber} · {attempt.aiScore ?? "—"}/100</p>
                              <p className="text-[11px] text-muted-foreground">{attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString("pt-BR") : "Data não informada"}</p>
                            </div>
                            {attempt.audioResponseUrl && <audio controls src={attempt.audioResponseUrl} className="h-8 w-full md:w-56" />}
                            <Button size="sm" variant="outline" onClick={() => { setSelectedAttemptId(attempt.id); setEvaluatingId(sub.id); }} className="text-xs">Avaliar esta</Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {sub.teacherFeedback && (
                      <div className="surface-card p-4 text-sm text-foreground">
                        <p className="font-bold text-red-700 mb-1">Feedback Registrado pelo Professor:</p>
                        <p className="whitespace-pre-wrap">{sub.teacherFeedback}</p>
                        {sub.teacherAudioFeedbackUrl && <audio controls src={sub.teacherAudioFeedbackUrl} className="mt-3 h-8 w-full" />}
                      </div>
                    )}

                    {evaluatingId === sub.id ? (
                      <div className="surface-card space-y-4 p-4">
                        <h4 className="text-sm font-bold text-foreground">Avaliar e Fornecer Feedback</h4>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-foreground">Nota (0 a 100)</label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={scoreVal}
                            onChange={(e) => setScoreVal(Number(e.target.value))}
                            className="field-control w-32 text-sm"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-foreground">Comentário do Professor</label>
                          <textarea
                            rows={2}
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            placeholder="Comentários sobre pronúncia, entonação e fluência..."
                            className="field-control w-full text-sm"
                          />
                        </div>
                        <div className="rounded-xl border border-dashed border-red-200 bg-red-50/50 p-3">
                          <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-foreground"><Volume2 size={14} className="text-red-600" /> Comentário em áudio (opcional)</label>
                          <input type="file" accept="audio/*" onChange={(event) => setFeedbackAudio(event.target.files?.[0] || null)} className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-red-600 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white" />
                          {feedbackAudio && <p className="mt-2 text-[11px] text-emerald-700">Arquivo pronto: {feedbackAudio.name}</p>}
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <Button
                            onClick={() => handleEvaluate(sub.id)}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                          >
                            Salvar Avaliação
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setEvaluatingId(null)}
                            className="text-xs"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          onClick={() => { setEvaluatingId(sub.id); setSelectedAttemptId(attempts[0]?.id || null); setFeedbackText(""); setFeedbackAudio(null); }}
                          className="bg-foreground text-background text-xs font-bold hover:bg-foreground/90"
                        >
                          Avaliar Submissão
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
