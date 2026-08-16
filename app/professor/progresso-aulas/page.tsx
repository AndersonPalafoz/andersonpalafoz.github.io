"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Mic, Sparkles, Loader2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ProfessorProgressSpeakingPage() {
  const [data, setData] = useState<{ students: any[]; lessonProgress: any[]; activityProgress: any[]; speakingAttempts?: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluatingId, setEvaluatingId] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [scoreVal, setScoreVal] = useState(95);
  const [feedbackAudio, setFeedbackAudio] = useState<File | null>(null);
  const [selectedAttemptId, setSelectedAttemptId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/professor/progress-speaking");
      const json = await res.json();
      if (res.ok) {
        setData(json);
      } else {
        toast.error(json.error || "Falha ao carregar dados.");
      }
    } catch (err) {
      toast.error("Erro ao carregar progresso e submissões.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleEvaluate = async (activityProgressId: number, triggerAI: boolean) => {
    try {
      const payload = new FormData();
      payload.append("activityProgressId", String(activityProgressId));
      payload.append("teacherFeedback", feedbackText);
      payload.append("score", String(scoreVal));
      payload.append("triggerAIAnalysis", String(triggerAI));
      if (selectedAttemptId) payload.append("attemptId", String(selectedAttemptId));
      if (feedbackAudio) payload.append("teacherAudio", feedbackAudio);
      const res = await fetch("/api/professor/progress-speaking", {
        method: "POST",
        body: payload,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha ao salvar avaliação");

      toast.success(triggerAI ? "Feedback gerado por IA e salvo com sucesso!" : "Avaliação salva com sucesso!");
      setEvaluatingId(null);
      setFeedbackText("");
      setFeedbackAudio(null);
      setSelectedAttemptId(null);
      void loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao avaliar");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-red-600" size={36} />
      </div>
    );
  }

  const students = data?.students || [];
  const lessonProgress = data?.lessonProgress || [];
  const activityProgress = data?.activityProgress || [];

  const speakingSubmissions = activityProgress.filter(ap => ap.activity?.type === "speaking" || ap.audioResponseUrl);
  const speakingAttempts = data?.speakingAttempts || [];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link href="/professor" className="text-sm font-semibold text-red-600 hover:underline flex items-center gap-1 mb-2">
              <ArrowLeft size={16} /> Voltar ao Painel do Professor
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Mic className="text-red-600" size={32} />
              Progresso de Aulas & Avaliação de Speaking (IA)
            </h1>
            <p className="text-gray-600 mt-1">
              Acompanhe as aulas concluídas pelos alunos vinculados e avalie as gravações de voz com análise automática de IA.
            </p>
          </div>
        </header>

        {/* Seção 1: Progresso de Aulas por Aluno */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle2 className="text-red-600" size={24} />
            Progresso Geral de Aulas dos Alunos
          </h2>

          {students.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">Nenhum aluno vinculado no momento.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map((student) => {
                const studentLessons = lessonProgress.filter(lp => lp.userId === student.id && lp.completed === 1);
                return (
                  <div key={student.id} className="p-5 rounded-xl border border-gray-200 bg-gray-50 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold">
                        {student.name ? student.name.charAt(0).toUpperCase() : "A"}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{student.name || "Aluno"}</h3>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-sm">
                      <span className="text-gray-600 font-medium">Aulas Concluídas:</span>
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

        {/* Seção 2: Submissões de Speaking & Feedback por IA */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="text-red-600" size={24} />
            Avaliação de Speaking & Feedback Automático por IA
          </h2>

          {speakingSubmissions.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <Mic className="mx-auto text-gray-300 mb-3" size={36} />
              <p className="font-semibold text-gray-800">Nenhuma gravação de speaking enviada pelos alunos ainda.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {speakingSubmissions.map((sub) => {
                const student = students.find(s => s.id === sub.userId);
                const attempts = speakingAttempts.filter((attempt) => attempt.userId === sub.userId && attempt.activityId === sub.activityId);
                return (
                  <div key={sub.id} className="p-6 rounded-xl border border-gray-200 bg-gray-50 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                            {sub.activity?.title || "Atividade de Speaking"}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">
                            Aluno: {student?.name || student?.email || `ID ${sub.userId}`}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          Status: <span className="uppercase text-red-600">{sub.status}</span> {sub.score ? `• Nota: ${sub.score}/100` : ""}
                        </p>
                      </div>
                      {sub.audioResponseUrl && (
                        <audio controls src={sub.audioResponseUrl} className="h-10 w-full md:w-64" />
                      )}
                    </div>

                    {attempts.length > 0 && (
                      <div className="rounded-xl bg-white border border-blue-100 p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold uppercase tracking-wide text-blue-700">Histórico de tentativas ({attempts.length})</p>
                          <span className="text-[11px] text-gray-500">A mais recente aparece primeiro</span>
                        </div>
                        {attempts.map((attempt: any) => (
                          <div key={attempt.id} className="flex flex-col md:flex-row md:items-center gap-3 rounded-lg border border-blue-50 bg-blue-50/40 p-3">
                            <div className="flex-1">
                              <p className="text-xs font-bold text-gray-800">Tentativa #{attempt.attemptNumber} · {attempt.aiScore ?? "—"}/100</p>
                              <p className="text-[11px] text-gray-500">{attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString("pt-BR") : "Data não informada"}</p>
                            </div>
                            {attempt.audioResponseUrl && <audio controls src={attempt.audioResponseUrl} className="h-8 w-full md:w-56" />}
                            <Button size="sm" variant="outline" onClick={() => { setSelectedAttemptId(attempt.id); setEvaluatingId(sub.id); }} className="text-xs">Avaliar esta</Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {sub.teacherFeedback && (
                      <div className="p-4 rounded-lg bg-white border border-red-100 text-sm text-gray-700">
                        <p className="font-bold text-red-700 mb-1">Feedback Registrado:</p>
                        <p className="whitespace-pre-wrap">{sub.teacherFeedback}</p>
                        {sub.teacherAudioFeedbackUrl && <audio controls src={sub.teacherAudioFeedbackUrl} className="mt-3 h-8 w-full" />}
                      </div>
                    )}

                    {evaluatingId === sub.id ? (
                      <div className="p-4 rounded-xl bg-white border border-gray-200 space-y-4">
                        <h4 className="font-bold text-gray-900 text-sm">Avaliar e Fornecer Feedback</h4>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Nota (0 a 100)</label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={scoreVal}
                            onChange={(e) => setScoreVal(Number(e.target.value))}
                            className="w-32 px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Comentário do Professor</label>
                          <textarea
                            rows={2}
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            placeholder="Comentários sobre pronúncia, entonação e fluência..."
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none"
                          />
                        </div>
                        <div className="rounded-lg border border-dashed border-red-200 bg-red-50/40 p-3">
                          <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-2"><Volume2 size={14} className="text-red-600" /> Comentário em áudio (opcional)</label>
                          <input type="file" accept="audio/*" onChange={(event) => setFeedbackAudio(event.target.files?.[0] || null)} className="block w-full text-xs text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-red-600 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white" />
                          {feedbackAudio && <p className="mt-2 text-[11px] text-emerald-700">Arquivo pronto: {feedbackAudio.name}</p>}
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <Button
                            onClick={() => handleEvaluate(sub.id, true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                          >
                            <Sparkles size={16} className="mr-1" /> Gerar Feedback Automático por IA & Salvar
                          </Button>
                          <Button
                            onClick={() => handleEvaluate(sub.id, false)}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                          >
                            Salvar Avaliação Manual
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
                          className="bg-gray-900 hover:bg-black text-white text-xs font-bold"
                        >
                          Avaliar com IA / Professor
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
