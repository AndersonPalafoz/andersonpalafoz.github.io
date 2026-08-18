"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, BarChart3, Loader2, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface PendingQuestion {
  id: number;
  content: string;
  createdAt: string;
  materialId: number;
  materialTitle: string;
  student: {
    id: number;
    name: string | null;
    email: string | null;
    avatarUrl: string | null;
  };
}

interface ClassAverage {
  id: number;
  name: string;
  institution: string;
  averageScore: number;
  gradesCount: number;
}

export function ProfessorSummaryDashboard() {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<PendingQuestion[]>([]);
  const [classes, setClasses] = useState<ClassAverage[]>([]);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const res = await fetch("/api/professor/resumo", { cache: "no-store" });
        const data = await res.json();
        if (res.ok) {
          setQuestions(data.pendingQuestions || []);
          setClasses(data.classAverages || []);
        } else {
          throw new Error(data.error || "Erro ao carregar resumo");
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Falha ao carregar painel de resumo.");
      } finally {
        setLoading(false);
      }
    };
    void loadSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-red-600">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-red-600">Dúvidas Pendentes</h2>
            <div className="p-2 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600">
              <MessageSquare size={18} />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900 dark:text-white">{questions.length}</p>
          <p className="text-xs text-gray-500">Perguntas enviadas por alunos nos materiais didáticos aguardando resposta.</p>
        </div>

        <div className="rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-red-600">Turmas Externas Ativas</h2>
            <div className="p-2 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600">
              <BarChart3 size={18} />
            </div>
          </div>
          <p className="text-3xl font-black text-gray-900 dark:text-white">{classes.length}</p>
          <p className="text-xs text-gray-500">Turmas gerenciadas com notas e frequência monitoradas.</p>
        </div>
      </div>

      {/* Listagem de Dúvidas Pendentes */}
      <div className="rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Últimas Dúvidas nos Materiais</h3>
            <p className="text-xs text-gray-500">Acesse diretamente o material para responder à dúvida do aluno.</p>
          </div>
          <Link href="/professor/turmas-externas" className="text-xs font-bold text-red-600 hover:underline">
            Gerenciar turmas e notas
          </Link>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <CheckCircle2 className="mx-auto text-emerald-500 mb-2" size={32} />
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Nenhuma dúvida pendente no momento!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q) => (
              <div key={q.id} className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">{q.student.name || q.student.email || "Aluno(a)"}</span>
                    <span className="text-[10px] bg-red-100 dark:bg-red-950/60 text-red-600 px-2 py-0.5 rounded-full font-bold">Material: {q.materialTitle}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">&ldquo;{q.content}&rdquo;</p>
                  <time className="text-[10px] text-gray-400">{new Date(q.createdAt).toLocaleString("pt-BR")}</time>
                </div>
                <Link
                  href={`/materiais/${q.materialId}`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700 shrink-0"
                >
                  Responder <ExternalLink size={13} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Médias de Notas por Turma */}
      <div className="rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6">
        <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
          <h3 className="font-bold text-gray-900 dark:text-white text-base">Média de Notas por Turma Externa</h3>
          <p className="text-xs text-gray-500">Visão consolidada do desempenho acadêmico das turmas parceiras e institucionais.</p>
        </div>

        {classes.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <AlertCircle className="mx-auto text-amber-500 mb-2" size={32} />
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Nenhuma turma externa cadastrada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classes.map((cls) => (
              <div key={cls.id} className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-red-600">{cls.institution}</span>
                    <h4 className="font-black text-gray-900 dark:text-white text-sm">{cls.name}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-gray-900 dark:text-white">{cls.averageScore}</span>
                    <span className="block text-[10px] text-gray-500">{cls.gradesCount} notas lançadas</span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-red-600 transition-all"
                    style={{ width: `${Math.min(Math.max((cls.averageScore / 10) * 100, 0), 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
