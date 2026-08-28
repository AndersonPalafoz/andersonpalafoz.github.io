"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Clock3, Loader2, RefreshCw, Search, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";

type AcademicStudent = {
  courseOfferStudentId: number | null;
  externalStudentId?: number | null;
  userId?: number | null;
  name: string | null;
  socialName?: string | null;
  email: string | null;
  studentIdNumber?: string | null;
  status: string;
  notes?: string | null;
  createdAt?: string;
  approvalStatus?: string;
};

type AcademicContext = { offerId: number | null; classId: number | null; courseId: number | null };

export default function ProfessorAlunosPage() {
  const searchParams = useSearchParams();
  const offerId = searchParams.get("offerId");
  const classId = searchParams.get("classId");
  const contextual = Boolean(offerId || classId);
  const [students, setStudents] = useState<AcademicStudent[]>([]);
  const [context, setContext] = useState<AcademicContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const loadStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (offerId) params.set("offerId", offerId);
      if (classId) params.set("classId", classId);
      const response = await fetch(`/api/professor/students${params.toString() ? `?${params}` : ""}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha ao carregar alunos");
      setStudents(data.students || []);
      setContext(data.context || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar alunos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadStudents(); }, [offerId, classId]);

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
      setStudents((current) => current.filter((student) => student.userId !== userId));
      toast.success(action === "approve" ? "Aluno aprovado." : "Solicitação recusada.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao revisar solicitação");
    } finally {
      setActionId(null);
    }
  };

  const filteredStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return students;
    return students.filter((student) => `${student.name || ""} ${student.socialName || ""} ${student.email || ""} ${student.studentIdNumber || ""}`.toLowerCase().includes(normalizedQuery));
  }, [query, students]);

  const title = contextual ? "Alunos da oferta" : "Solicitações de alunos";
  const description = contextual
    ? "Gerencie a lista acadêmica desta oferta. A conta no site é opcional e não impede o controle de matrícula, frequência ou notas."
    : "Revise solicitações de acesso de alunos com conta. Alunos externos sem conta são gerenciados dentro de uma oferta acadêmica.";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-slate-900/50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <Link href="/professor" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:underline"><ArrowLeft size={16} /> Voltar ao painel do professor</Link>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-600">Gestão acadêmica contextual</p>
              <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
              <p className="mt-2 max-w-2xl text-gray-600 dark:text-slate-400">{description}</p>
              {context && <p className="mt-3 inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 dark:bg-red-950/30 dark:text-red-300">Oferta #{context.offerId ?? "legada"} · {students.length} registro(s) acadêmico(s)</p>}
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => void loadStudents()} disabled={loading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 px-3 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-60" aria-label="Atualizar alunos"><RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Atualizar</button>
              <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"><Clock3 size={18} /> {students.length}</div>
            </div>
          </div>
        </header>

        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {loading ? <div className="space-y-3 p-6" aria-busy="true"><div className="h-20 animate-pulse rounded-2xl bg-gray-100 dark:bg-slate-800" /><div className="h-20 animate-pulse rounded-2xl bg-gray-100 dark:bg-slate-800" /><p className="text-center text-sm text-gray-500">Carregando alunos…</p></div> : (
            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {students.length > 0 && <div className="p-4 sm:px-6"><label className="relative block"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-900 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="Buscar por nome, e-mail ou matrícula" aria-label="Buscar alunos" /></label></div>}
              {filteredStudents.length === 0 && <div className="p-12 text-center"><UserCheck size={44} className="mx-auto text-green-600" /><h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">{contextual ? "Nenhum aluno nesta oferta" : "Nenhuma solicitação pendente"}</h2><p className="mt-2 text-gray-600 dark:text-slate-400">{contextual ? "Alunos externos podem ser matriculados sem possuir conta no site." : "Novas solicitações aparecerão aqui para revisão."}</p></div>}
              {filteredStudents.map((student) => {
                const pendingRequest = !contextual && student.approvalStatus === "pending" && student.userId;
                return <article key={student.courseOfferStudentId ?? `request-${student.userId}`} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <div>
                    <h2 className="font-bold text-gray-900 dark:text-white">{student.socialName || student.name || "Aluno sem nome"}</h2>
                    <p className="text-sm text-gray-600 dark:text-slate-400">{student.email || "Sem conta vinculada"}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">Matrícula acadêmica: {student.courseOfferStudentId ?? "legada"}</span>
                      <span className={`rounded-full px-2 py-1 font-semibold ${student.userId ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-800"}`}>{student.userId ? "Conta vinculada" : "Sem conta no site"}</span>
                      {student.studentIdNumber && <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">Registro: {student.studentIdNumber}</span>}
                    </div>
                  </div>
                  {pendingRequest && <div className="flex flex-col gap-2 sm:flex-row"><button disabled={actionId === student.userId} onClick={() => void review(student.userId!, "reject")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"><UserX size={16} /> Recusar</button><button disabled={actionId === student.userId} onClick={() => void review(student.userId!, "approve")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60">{actionId === student.userId ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />} Aprovar aluno</button></div>}
                </article>;
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
