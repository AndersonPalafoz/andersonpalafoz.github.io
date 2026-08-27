"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Clock3, Loader2, RefreshCw, Search, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";

type StudentRequest = {
  id: number;
  name: string | null;
  email: string | null;
  requestedRole: string | null;
  approvalStatus: string;
  createdAt: string;
};

export default function ProfessorAlunosPage() {
  const [students, setStudents] = useState<StudentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/professor/students");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha ao carregar solicitações");
      setStudents(data.students || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar solicitações");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStudents();
  }, []);

  const review = async (userId: number, action: "approve" | "reject") => {
    try {
      setActionId(userId);
      const response = await fetch("/api/professor/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha ao revisar solicitação");
      setStudents((current) => current.filter((student) => student.id !== userId));
      toast.success(action === "approve" ? "Aluno aprovado e vinculado ao seu acompanhamento." : "Solicitação recusada.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao revisar solicitação");
    } finally {
      setActionId(null);
    }
  };

  const filteredStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return students;
    return students.filter((student) => `${student.name || ""} ${student.email || ""}`.toLowerCase().includes(normalizedQuery));
  }, [query, students]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-900/50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm sm:p-8">
          <Link href="/professor" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:underline">
            <ArrowLeft size={16} /> Voltar ao painel do professor
          </Link>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-600">Moderação pedagógica</p>
              <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">Solicitações de alunos</h1>
              <p className="mt-2 max-w-2xl text-gray-600 dark:text-slate-400">Revise solicitações de acesso de alunos. Professores não podem aprovar outros professores nem alterar papéis administrativos.</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => void loadStudents()} disabled={loading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 px-3 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-60" aria-label="Atualizar solicitações"><RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Atualizar</button>
              <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                <Clock3 size={18} /> {students.length} pendentes
              </div>
            </div>
          </div>
        </header>

        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

        <section className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          {loading ? (
            <div className="space-y-3 p-5 sm:p-6" aria-busy="true"><div className="h-20 animate-pulse rounded-2xl bg-gray-100 dark:bg-slate-800" /><div className="h-20 animate-pulse rounded-2xl bg-gray-100 dark:bg-slate-800" /><p className="text-center text-sm text-gray-500 dark:text-slate-400">Carregando solicitações…</p></div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center"><UserCheck size={44} className="mx-auto text-green-600" /><h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">Nenhuma solicitação pendente</h2><p className="mt-2 text-gray-600 dark:text-slate-400">Novas solicitações aparecerão aqui para revisão.</p></div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              <div className="p-4 sm:px-6"><label className="relative block"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-900 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="Buscar por nome ou e-mail" aria-label="Buscar solicitações de alunos" /></label></div>
              {filteredStudents.length === 0 && <div className="p-10 text-center text-sm text-gray-500 dark:text-slate-400">Nenhuma solicitação corresponde à busca atual.</div>}
              {filteredStudents.map((student) => (
                <article key={student.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <div>
                    <h2 className="font-bold text-gray-900 dark:text-white">{student.name || "Usuário sem nome"}</h2>
                    <p className="text-sm text-gray-600 dark:text-slate-400">{student.email || "Email não informado"}</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Solicitado em {new Date(student.createdAt).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button disabled={actionId === student.id} onClick={() => void review(student.id, "reject")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 dark:border-red-900/50 px-4 py-2 text-sm font-semibold text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-60"><UserX size={16} /> Recusar</button>
                    <button disabled={actionId === student.id} onClick={() => void review(student.id, "approve")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60">{actionId === student.id ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />} Aprovar aluno</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
