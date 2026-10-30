"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Mic, Play, CheckCircle2, Star, Send, Loader2, Award, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/hooks/useAuth";

interface Submission {
  id: number;
  userId: number;
  studentName: string;
  studentEmail: string;
  activityId: number;
  activityTitle: string;
  audioUrl: string;
  transcript: string;
  feedback: string;
  score: number;
  status: string;
  updatedAt: string;
}

export default function ProfessorSpeakingEvalPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [gradingId, setGradingId] = useState<number | null>(null);
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<number, string>>({});
  const [scoreDrafts, setScoreDrafts] = useState<Record<number, number>>({});

  const loadSubmissions = useCallback(async (signal?: AbortSignal) => {
    try {
      if (signal?.aborted) return;
      setLoading(true);
      const res = await fetch("/api/speaking", { cache: "no-store", signal });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao carregar submissões de speaking.");
      if (!signal?.aborted) setSubmissions(data.submissions || []);
    } catch (err) {
      if (!signal?.aborted) toast.error(err instanceof Error ? err.message : "Erro ao carregar gravações.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !["professor", "admin", "super_admin"].includes(user.role || "")) {
      window.location.href = "/";
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(() => { void loadSubmissions(controller.signal); }, 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [authLoading, user, loadSubmissions]);

  const handleGrade = async (progressId: number) => {
    const feedback = (feedbackDrafts[progressId] || "").trim();
    const score = scoreDrafts[progressId] ?? 100;
    if (!feedback) {
      toast.error("Escreva um feedback pedagógico antes de avaliar.");
      return;
    }

    setGradingId(progressId);
    try {
      const res = await fetch("/api/speaking", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progressId, feedback, score }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar avaliação.");

      toast.success("Avaliação de speaking salva com sucesso!");
      setSubmissions((prev) =>
        prev.map((s) => (s.id === progressId ? { ...s, feedback, score, status: "graded" } : s))
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao avaliar gravação.");
    } finally {
      setGradingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-red-600" size={36} aria-label="Carregando gravações" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16 text-slate-900 dark:bg-slate-950 dark:text-white">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="page-container py-8">
          <Link href="/professor" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-red-600">
            <ArrowLeft size={16} aria-hidden="true" /> Voltar ao Painel
          </Link>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-red-700 dark:border-slate-700 dark:bg-slate-900 dark:text-red-300">
                <Mic size={15} aria-hidden="true" /> Avaliação de Pronúncia & Oralidade
              </span>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">Gravações de Speaking dos Alunos</h1>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">Ouça áudios enviados nas aulas, confira a transcrição e atribua notas e feedback oficial.</p>
            </div>
          </div>
        </div>
      </header>

      <main className="page-container mt-8 space-y-6">
        {submissions.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900 text-slate-600 dark:text-slate-300">
            <Mic className="mx-auto text-slate-600 dark:text-slate-300/40" size={48} />
            <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">Nenhuma gravação de speaking enviada</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Assim que os alunos gravarem áudios nas atividades de speaking, eles aparecerão aqui para avaliação.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {submissions.map((sub) => (
              <article key={sub.id} className="rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-sm text-card-foreground">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-border/60 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-bold text-red-700 dark:border-slate-700 dark:bg-slate-900 dark:text-red-300">
                        <User size={13} aria-hidden="true" /> {sub.studentName}
                      </span>
                      <span className="text-xs text-slate-600 dark:text-slate-300">({sub.studentEmail})</span>
                    </div>
                    <h2 className="mt-2 text-lg font-black text-slate-900 dark:text-white">{sub.activityTitle}</h2>
                    <time className="text-xs text-slate-600 dark:text-slate-300">Enviado em: {new Date(sub.updatedAt).toLocaleString("pt-BR")}</time>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${
                      sub.status === "graded" ? "border border-slate-200 bg-slate-100 text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-emerald-300" : "border border-slate-200 bg-slate-100 text-amber-700 dark:border-slate-700 dark:bg-slate-900 dark:text-amber-300"
                    }`}>
                      {sub.status === "graded" ? "Avaliado" : "Pendente de Avaliação"}
                    </span>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {/* Player de Áudio */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">Áudio do Aluno</p>
                    <audio controls className="w-full" src={sub.audioUrl}>
                      Seu navegador não suporta reprodução de áudio.
                    </audio>
                  </div>

                  {sub.transcript && (
                    <div className="rounded-2xl border border-border/60 bg-slate-100 dark:bg-slate-950 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">Transcrição / Texto de Apoio</p>
                      <p className="text-sm italic text-slate-900 dark:text-white">&ldquo;{sub.transcript}&rdquo;</p>
                    </div>
                  )}

                  {/* Feedback anterior ou formulário de avaliação */}
                  <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-4 space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-widest text-red-600">Avaliação do Professor</h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="w-full sm:w-48">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">Nota (0 - 100)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={scoreDrafts[sub.id] ?? sub.score ?? 100}
                          onChange={(e) => setScoreDrafts({ ...scoreDrafts, [sub.id]: Number(e.target.value) })}
                          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950 px-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-red-600"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">Feedback Pedagógico</label>
                        <textarea
                          rows={2}
                          value={feedbackDrafts[sub.id] ?? sub.feedback ?? ""}
                          onChange={(e) => setFeedbackDrafts({ ...feedbackDrafts, [sub.id]: e.target.value })}
                          placeholder="Ex: Excelente entonação e clareza na pronúncia. Continue praticando as vogais..."
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-red-600"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => void handleGrade(sub.id)}
                        disabled={gradingId === sub.id}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
                      >
                        <Send size={15} aria-hidden="true" />
                        {gradingId === sub.id ? "Salvando..." : "Salvar Avaliação"}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
