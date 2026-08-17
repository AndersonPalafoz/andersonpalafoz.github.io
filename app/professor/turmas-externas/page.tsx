"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Building2, Plus, Trash2, Users, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ExternalStudentItem {
  id: number;
  name: string;
  email: string | null;
  studentIdNumber: string | null;
  status: string;
  notes: string | null;
}

interface ExternalClassItem {
  id: number;
  institution: string;
  className: string;
  courseName: string;
  academicTerm: string;
  description: string | null;
  students: ExternalStudentItem[];
}

export default function TurmasExternasPage() {
  const [classes, setClasses] = useState<ExternalClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states for creating class
  const [institution, setInstitution] = useState("SIMAL");
  const [className, setClassName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [academicTerm, setAcademicTerm] = useState("2026.1");
  const [description, setDescription] = useState("");

  // Form states for adding student
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentIdNumber, setStudentIdNumber] = useState("");
  const [studentNotes, setStudentNotes] = useState("");

  const loadClasses = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/professor/external-classes");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao carregar turmas externas.");
      setClasses(data.classes || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao carregar turmas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadClasses();
  }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className || !courseName || !academicTerm) {
      toast.error("Preencha todos os campos obrigatórios da turma.");
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch("/api/professor/external-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createClass",
          institution,
          className,
          courseName,
          academicTerm,
          description,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar turma.");
      toast.success("Turma externa criada com sucesso!");
      setClassName("");
      setCourseName("");
      setDescription("");
      void loadClasses();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar turma.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !studentName) {
      toast.error("Selecione uma turma e informe o nome do aluno.");
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch("/api/professor/external-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addStudent",
          classId: selectedClassId,
          studentName,
          studentEmail,
          studentIdNumber,
          studentNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao cadastrar aluno.");
      toast.success("Aluno cadastrado na turma externa!");
      setStudentName("");
      setStudentEmail("");
      setStudentIdNumber("");
      setStudentNotes("");
      void loadClasses();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao cadastrar aluno.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveStudent = async (studentId: number) => {
    if (!confirm("Deseja realmente remover este aluno da turma?")) return;
    try {
      const res = await fetch("/api/professor/external-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "removeStudent", studentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao remover aluno.");
      toast.success("Aluno removido com sucesso.");
      void loadClasses();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover aluno.");
    }
  };

  const handleRemoveClass = async (classId: number) => {
    if (!confirm("Deseja realmente excluir esta turma externa e todos os seus alunos?")) return;
    try {
      const res = await fetch("/api/professor/external-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "removeClass", classId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao excluir turma.");
      toast.success("Turma excluída com sucesso.");
      void loadClasses();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir turma.");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-950 px-4 py-8 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm sm:p-8">
          <Link href="/professor" className="mb-4 inline-flex items-center gap-2 text-xs font-black text-red-600 hover:underline">
            <ArrowLeft size={15} /> Voltar ao Painel do Professor
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-red-600">Gestão de Projetos e Instituições Externas</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950 dark:text-white">Cadastro Manual de Turmas & Alunos</h1>
              <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-6 text-gray-500 dark:text-gray-400">Gerencie turmas presenciais ou de terceiros (como SIMAL, Megaworks, UFBA) sem depender da plataforma principal de alunos.</p>
            </div>
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-4 py-3 rounded-2xl flex items-center gap-3">
              <Building2 className="text-red-600 shrink-0" size={22} />
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-500">Instituições Ativas</p>
                <p className="text-sm font-black text-gray-950 dark:text-white">SIMAL • Megaworks • UFBA</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulários de Cadastro */}
          <div className="space-y-6 lg:col-span-1">
            {/* Criar Turma */}
            <section className="rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-black text-gray-950 dark:text-white flex items-center gap-2">
                <BookOpen size={18} className="text-red-600" /> Nova Turma Externa
              </h2>
              <form onSubmit={handleCreateClass} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Instituição / Projeto</label>
                  <select
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 p-3 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    <option value="SIMAL">Projeto SIMAL</option>
                    <option value="Megaworks">Megaworks</option>
                    <option value="UFBA">UFBA (Universidade)</option>
                    <option value="Outro">Outra Instituição</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Nome da Turma</label>
                  <input
                    type="text"
                    placeholder="Ex: Turma Avançada Sábado"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 p-3 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Nome do Curso / Disciplina</label>
                  <input
                    type="text"
                    placeholder="Ex: English Grammar & Speaking"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 p-3 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Período / Semestre</label>
                  <input
                    type="text"
                    placeholder="Ex: 2026.1"
                    value={academicTerm}
                    onChange={(e) => setAcademicTerm(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 p-3 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Observações (Opcional)</label>
                  <textarea
                    placeholder="Detalhes sobre horários ou local..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 p-3 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-xs p-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} Cadastrar Turma
                </button>
              </form>
            </section>

            {/* Adicionar Aluno à Turma */}
            <section className="rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-black text-gray-950 dark:text-white flex items-center gap-2">
                <Users size={18} className="text-red-600" /> Matricular Aluno Externo
              </h2>
              <form onSubmit={handleAddStudent} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Selecionar Turma</label>
                  <select
                    value={selectedClassId || ""}
                    onChange={(e) => setSelectedClassId(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 p-3 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    <option value="">Selecione a turma...</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        [{c.institution}] {c.className} — {c.courseName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Nome Completo do Aluno</label>
                  <input
                    type="text"
                    placeholder="Ex: João da Silva"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 p-3 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">E-mail (Opcional)</label>
                  <input
                    type="email"
                    placeholder="aluno@email.com"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 p-3 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Matrícula / ID Institucional</label>
                  <input
                    type="text"
                    placeholder="Ex: 202612345"
                    value={studentIdNumber}
                    onChange={(e) => setStudentIdNumber(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 p-3 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting || !selectedClassId}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs p-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} Adicionar à Turma
                </button>
              </form>
            </section>
          </div>

          {/* Listagem de Turmas e Alunos Cadastrados */}
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-black text-gray-950 dark:text-white">Turmas & Alunos Externos Cadastrados</h2>
                  <p className="text-xs text-gray-500">Visualização consolidada por instituição e turma.</p>
                </div>
                <span className="bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200 font-bold text-xs px-3 py-1 rounded-full">
                  {classes.length} Turma(s)
                </span>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <Loader2 className="animate-spin text-red-600" size={32} />
                </div>
              ) : classes.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <AlertCircle className="mx-auto text-gray-400" size={40} />
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Nenhuma turma externa cadastrada.</p>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">Utilize o formulário ao lado para cadastrar sua primeira turma do Projeto SIMAL, Megaworks ou UFBA.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {classes.map((cls) => (
                    <div key={cls.id} className="border border-gray-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 bg-gray-50/50 dark:bg-slate-800/40">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="bg-red-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                              {cls.institution}
                            </span>
                            <span className="text-xs font-bold text-gray-500">Período: {cls.academicTerm}</span>
                          </div>
                          <h3 className="text-base font-black text-gray-950 dark:text-white mt-1">{cls.className}</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">{cls.courseName}</p>
                          {cls.description && <p className="text-xs text-gray-500 mt-1 italic">{cls.description}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleRemoveClass(cls.id)}
                          className="self-start sm:self-center text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 p-2.5 rounded-xl transition flex items-center gap-1.5 text-xs font-bold"
                          title="Excluir Turma"
                        >
                          <Trash2 size={16} /> Excluir Turma
                        </button>
                      </div>

                      {/* Alunos da Turma */}
                      <div className="space-y-2 pt-2 border-t border-gray-200/60 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                            <Users size={14} /> Alunos Matriculados ({cls.students.length})
                          </h4>
                          <span className="text-[11px] text-gray-400">Gerenciamento manual</span>
                        </div>

                        {cls.students.length === 0 ? (
                          <p className="text-xs text-gray-400 italic py-2">Nenhum aluno cadastrado nesta turma ainda.</p>
                        ) : (
                          <div className="divide-y divide-gray-200 dark:divide-slate-700">
                            {cls.students.map((st) => (
                              <div key={st.id} className="py-2.5 flex items-center justify-between text-xs">
                                <div>
                                  <span className="font-bold text-gray-900 dark:text-white">{st.name}</span>
                                  {st.studentIdNumber && <span className="ml-2 text-gray-500 font-mono text-[11px]">ID: {st.studentIdNumber}</span>}
                                  {st.email && <span className="block text-[11px] text-gray-500">{st.email}</span>}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => void handleRemoveStudent(st.id)}
                                  className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                                  title="Remover aluno"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
