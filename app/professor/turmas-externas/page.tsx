"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Building2, Plus, Trash2, Users, Loader2, AlertCircle, Search, Edit3, X, FileSpreadsheet, BarChart3 } from "lucide-react";
import { toast } from "sonner";

interface ExternalStudentItem {
  id: number;
  name: string;
  email: string | null;
  studentIdNumber: string | null;
  status: string;
  notes: string | null;
}

interface ExternalClassStats {
  total: number;
  active: number;
  completed: number;
}

interface ExternalClassItem {
  id: number;
  institution: string;
  className: string;
  courseName: string;
  academicTerm: string;
  description: string | null;
  students: ExternalStudentItem[];
  stats?: ExternalClassStats;
}

export default function TurmasExternasPage() {
  const [classes, setClasses] = useState<ExternalClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInstitutionFilter, setSelectedInstitutionFilter] = useState("all");
  const [studentStatusFilter, setStudentStatusFilter] = useState("all");

  // Edit class mode
  const [editingClassId, setEditingClassId] = useState<number | null>(null);

  // Edit student mode
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);

  // Form states for creating/editing class
  const [institution, setInstitution] = useState("SIMAL");
  const [className, setClassName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [academicTerm, setAcademicTerm] = useState("2026.1");
  const [description, setDescription] = useState("");

  // Form states for adding/editing student
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentIdNumber, setStudentIdNumber] = useState("");
  const [studentStatus, setStudentStatus] = useState("active");
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

  // Visão consolidada por instituição
  const institutionSummary = useMemo(() => {
    const summary: Record<string, { classesCount: number; studentsCount: number; activeCount: number }> = {};
    for (const cls of classes) {
      if (!summary[cls.institution]) {
        summary[cls.institution] = { classesCount: 0, studentsCount: 0, activeCount: 0 };
      }
      summary[cls.institution].classesCount += 1;
      summary[cls.institution].studentsCount += cls.students.length;
      summary[cls.institution].activeCount += cls.students.filter(s => s.status === "active").length;
    }
    return summary;
  }, [classes]);

  const filteredClasses = useMemo(() => {
    return classes.map((cls) => {
      // Filtrar alunos da turma com base no status e termo de busca
      const filteredStudents = cls.students.filter((s) => {
        const matchesStatus = studentStatusFilter === "all" || s.status === studentStatusFilter;
        const term = searchTerm.toLowerCase();
        const matchesTerm = !term || s.name.toLowerCase().includes(term) || (s.email && s.email.toLowerCase().includes(term)) || (s.studentIdNumber && s.studentIdNumber.toLowerCase().includes(term));
        return matchesStatus && matchesTerm;
      });

      return {
        ...cls,
        filteredStudents,
      };
    }).filter((cls) => {
      const matchesInstitution = selectedInstitutionFilter === "all" || cls.institution.toLowerCase() === selectedInstitutionFilter.toLowerCase();
      const term = searchTerm.toLowerCase();
      const matchesClassSearch = !term || cls.className.toLowerCase().includes(term) || cls.courseName.toLowerCase().includes(term) || cls.institution.toLowerCase().includes(term);
      const hasMatchingStudents = cls.filteredStudents.length > 0;
      return matchesInstitution && (matchesClassSearch || hasMatchingStudents);
    });
  }, [classes, selectedInstitutionFilter, studentStatusFilter, searchTerm]);

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className || !courseName || !academicTerm) {
      toast.error("Preencha todos os campos obrigatórios da turma.");
      return;
    }
    try {
      setSubmitting(true);
      const action = editingClassId ? "updateClass" : "createClass";
      const body = editingClassId
        ? { action, classId: editingClassId, institution, className, courseName, academicTerm, description }
        : { action, institution, className, courseName, academicTerm, description };

      const res = await fetch("/api/professor/external-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar turma.");
      toast.success(editingClassId ? "Turma atualizada com sucesso!" : "Turma externa criada com sucesso!");
      resetClassForm();
      void loadClasses();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar turma.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEditClass = (cls: ExternalClassItem) => {
    setEditingClassId(cls.id);
    setInstitution(cls.institution);
    setClassName(cls.className);
    setCourseName(cls.courseName);
    setAcademicTerm(cls.academicTerm);
    setDescription(cls.description || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetClassForm = () => {
    setEditingClassId(null);
    setInstitution("SIMAL");
    setClassName("");
    setCourseName("");
    setAcademicTerm("2026.1");
    setDescription("");
  };

  const handleDeleteClass = async (classId: number) => {
    if (!window.confirm("Deseja realmente excluir esta turma e todos os seus alunos cadastrados?")) return;
    try {
      const res = await fetch("/api/professor/external-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteClass", classId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao excluir turma.");
      toast.success("Turma externa excluída com sucesso.");
      void loadClasses();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir turma.");
    }
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !studentName) {
      toast.error("Selecione uma turma e informe o nome do aluno.");
      return;
    }
    try {
      setSubmitting(true);
      const action = editingStudentId ? "updateStudent" : "addStudent";
      const body = editingStudentId
        ? { action, studentId: editingStudentId, studentName, studentEmail, studentIdNumber, studentStatus, studentNotes }
        : { action, classId: selectedClassId, studentName, studentEmail, studentIdNumber, studentStatus, studentNotes };

      const res = await fetch("/api/professor/external-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar aluno.");
      toast.success(editingStudentId ? "Dados do aluno atualizados!" : "Aluno matriculado com sucesso!");
      resetStudentForm();
      void loadClasses();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar aluno.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEditStudent = (student: ExternalStudentItem, classId: number) => {
    setEditingStudentId(student.id);
    setSelectedClassId(classId);
    setStudentName(student.name);
    setStudentEmail(student.email || "");
    setStudentIdNumber(student.studentIdNumber || "");
    setStudentStatus(student.status);
    setStudentNotes(student.notes || "");
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  const resetStudentForm = () => {
    setEditingStudentId(null);
    setSelectedClassId(null);
    setStudentName("");
    setStudentEmail("");
    setStudentIdNumber("");
    setStudentStatus("active");
    setStudentNotes("");
  };

  const handleDeleteStudent = async (studentId: number) => {
    if (!window.confirm("Deseja realmente remover este aluno da turma?")) return;
    try {
      const res = await fetch("/api/professor/external-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteStudent", studentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao remover aluno.");
      toast.success("Aluno removido da turma com sucesso.");
      void loadClasses();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover aluno.");
    }
  };

  const handleUpdateStudentStatus = async (studentId: number, newStatus: string) => {
    try {
      const res = await fetch("/api/professor/external-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateStudentStatus", studentId, studentStatus: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar status.");
      toast.success("Status do aluno atualizado.");
      void loadClasses();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar status.");
    }
  };

  // Importação CSV em lote
  const handleCsvImport = async (classId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;

        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length < 2) {
          toast.error("O arquivo CSV precisa de um cabeçalho e ao menos uma linha de dados.");
          return;
        }

        const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/['"]+/g, ""));
        const csvData = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map(v => v.trim().replace(/['"]+/g, ""));
          const row: Record<string, string> = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || "";
          });
          if (row.name || row.nome) {
            csvData.push(row);
          }
        }

        if (csvData.length === 0) {
          toast.error("Nenhum aluno válido encontrado no arquivo CSV.");
          return;
        }

        setSubmitting(true);
        const res = await fetch("/api/professor/external-classes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "importCsvStudents", classId, csvData }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao importar CSV.");
        toast.success(`${data.importedCount} alunos importados com sucesso via CSV!`);
        void loadClasses();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao processar arquivo CSV.");
      } finally {
        setSubmitting(false);
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Cabeçalho */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Link
                href="/professor"
                className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition shadow-xs"
                title="Voltar ao Painel"
              >
                <ArrowLeft size={18} />
              </Link>
              <h1 className="text-2xl font-black tracking-tight text-gray-950 dark:text-white flex items-center gap-2">
                <Building2 className="text-red-600" size={26} /> Gestão Avançada de Cursos e Turmas Externas
              </h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 pl-13">
              Controle turmas, matrículas, importação CSV em lote e acompanhamento acadêmico por instituição (IsF, PROFICI, SIMAL, Megaworks, UFBA).
            </p>
          </div>
        </header>

        {/* Resumo Consolidado por Instituição */}
        {Object.keys(institutionSummary).length > 0 && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(institutionSummary).map(([inst, summary]) => (
              <div key={inst} className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300">
                    {inst}
                  </span>
                  <BarChart3 size={16} className="text-gray-400" />
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="bg-gray-50 dark:bg-slate-800/60 p-2 rounded-xl">
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Turmas</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white">{summary.classesCount}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-800/60 p-2 rounded-xl">
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Alunos</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white">{summary.studentsCount}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-800/60 p-2 rounded-xl">
                    <p className="text-[10px] text-green-600 font-bold uppercase">Ativos</p>
                    <p className="text-sm font-black text-green-600">{summary.activeCount}</p>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Barra de Busca e Filtros Globais */}
        <section className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Buscar por turma, curso ou aluno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 whitespace-nowrap">Status Aluno:</span>
              <select
                value={studentStatusFilter}
                onChange={(e) => setStudentStatusFilter(e.target.value)}
                className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativos</option>
                <option value="completed">Concluídos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 whitespace-nowrap">Instituição:</span>
              {["all", "IsF", "PROFICI", "SIMAL", "Megaworks", "UFBA"].map((inst) => (
                <button
                  key={inst}
                  type="button"
                  onClick={() => setSelectedInstitutionFilter(inst)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    selectedInstitutionFilter === inst
                      ? "bg-red-600 text-white shadow-xs"
                      : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {inst === "all" ? "Todas" : inst}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulários de Cadastro / Edição */}
          <div className="space-y-6 lg:col-span-1">
            {/* Criar / Editar Turma */}
            <section className="rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-gray-950 dark:text-white flex items-center gap-2">
                  <BookOpen size={18} className="text-red-600" /> {editingClassId ? "Editar Turma Externa" : "Nova Turma Externa"}
                </h2>
                {editingClassId && (
                  <button
                    type="button"
                    onClick={resetClassForm}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg"
                    title="Cancelar Edição"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <form onSubmit={handleSaveClass} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Instituição / Programa</label>
                  <select
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 p-3 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    <option value="IsF">IsF (Idioma sem Fronteiras)</option>
                    <option value="PROFICI">PROFICI</option>
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
                    placeholder="Ex: Turma Leitura Instrumental A"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 p-3 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Curso / Disciplina</label>
                  <input
                    type="text"
                    placeholder="Ex: Inglês Instrumental para Pós-Graduação"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 p-3 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Período Letivo</label>
                  <input
                    type="text"
                    placeholder="Ex: 2026.1"
                    value={academicTerm}
                    onChange={(e) => setAcademicTerm(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 p-3 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Observações / Descrição</label>
                  <textarea
                    placeholder="Informações adicionais..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 p-3 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  {editingClassId ? "Salvar Alterações da Turma" : "Criar Turma"}
                </button>
              </form>
            </section>

            {/* Matricular ou Editar Aluno */}
            <section className="rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-gray-950 dark:text-white flex items-center gap-2">
                  <Users size={18} className="text-red-600" /> {editingStudentId ? "Editar Aluno" : "Matricular Aluno"}
                </h2>
                {editingStudentId && (
                  <button
                    type="button"
                    onClick={resetStudentForm}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    title="Cancelar Edição"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <form onSubmit={handleSaveStudent} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Selecionar Turma</label>
                  <select
                    value={selectedClassId || ""}
                    onChange={(e) => setSelectedClassId(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 p-3 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    <option value="">-- Escolha a Turma --</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        [{cls.institution}] {cls.className} ({cls.courseName})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    placeholder="Nome do aluno..."
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 p-3 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
                  <input
                    type="email"
                    placeholder="aluno@email.com"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 p-3 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Matrícula / ID</label>
                  <input
                    type="text"
                    placeholder="Nº de matrícula..."
                    value={studentIdNumber}
                    onChange={(e) => setStudentIdNumber(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 p-3 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={studentStatus}
                    onChange={(e) => setStudentStatus(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 p-3 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    <option value="active">Ativo</option>
                    <option value="completed">Concluído</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={submitting || !selectedClassId}
                  className="w-full py-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  {editingStudentId ? "Salvar Aluno" : "Matricular Aluno"}
                </button>
              </form>
            </section>
          </div>

          {/* Listagem de Turmas, Alunos e Importação CSV */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              <div className="py-24 text-center text-gray-400 text-xs font-semibold flex flex-col items-center justify-center gap-3">
                <Loader2 size={24} className="animate-spin text-red-600" /> Carregando turmas e dados acadêmicos...
              </div>
            ) : filteredClasses.length === 0 ? (
              <div className="rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center space-y-3">
                <AlertCircle size={32} className="mx-auto text-gray-400" />
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Nenhum registro encontrado</h3>
                <p className="text-xs text-gray-500">Ajuste os filtros de busca ou cadastre uma nova turma externa.</p>
              </div>
            ) : (
              filteredClasses.map((cls) => (
                <div key={cls.id} className="rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300">
                          {cls.institution}
                        </span>
                        <span className="text-xs font-bold text-gray-500">Período: {cls.academicTerm}</span>
                      </div>
                      <h3 className="text-lg font-black text-gray-950 dark:text-white">{cls.className}</h3>
                      <p className="text-xs font-semibold text-red-600 dark:text-red-400">{cls.courseName}</p>
                      {cls.description && <p className="text-xs text-gray-500 pt-1">{cls.description}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <label className="cursor-pointer px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                        <FileSpreadsheet size={14} className="text-green-600" /> Importar CSV
                        <input
                          type="file"
                          accept=".csv"
                          className="hidden"
                          onChange={(e) => void handleCsvImport(cls.id, e)}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => startEditClass(cls)}
                        className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition flex items-center gap-1.5 text-gray-700 dark:text-gray-300"
                      >
                        <Edit3 size={14} /> Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClass(cls.id)}
                        className="px-3 py-2 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 text-xs font-bold hover:bg-red-100 transition text-red-700 dark:text-red-300 flex items-center gap-1.5"
                      >
                        <Trash2 size={14} /> Excluir
                      </button>
                    </div>
                  </div>

                  {/* Resumo estatístico da turma */}
                  {cls.stats && (
                    <div className="grid grid-cols-3 gap-3 bg-gray-50 dark:bg-slate-800/50 p-3 rounded-2xl text-center">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Total</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white mt-0.5">{cls.stats.total}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-green-600">Ativos</p>
                        <p className="text-sm font-black text-green-600 mt-0.5">{cls.stats.active}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Concluídos</p>
                        <p className="text-sm font-black text-blue-600 mt-0.5">{cls.stats.completed}</p>
                      </div>
                    </div>
                  )}

                  {/* Lista de Alunos Filtrados */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                        <Users size={14} /> Alunos ({cls.filteredStudents.length} de {cls.students.length})
                      </h4>
                      <button
                        type="button"
                        onClick={() => setSelectedClassId(cls.id)}
                        className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                      >
                        <Plus size={14} /> Matricular aluno
                      </button>
                    </div>

                    {cls.filteredStudents.length === 0 ? (
                      <p className="text-xs text-gray-400 italic py-3 bg-gray-50/50 dark:bg-slate-800/30 rounded-xl px-4 text-center">
                        Nenhum aluno encontrado com os filtros atuais nesta turma.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {cls.filteredStudents.map((student) => (
                          <div key={student.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-800/60 hover:border-gray-300 transition">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-gray-900 dark:text-white">{student.name}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  student.status === "completed"
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                                    : student.status === "inactive"
                                    ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                    : "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300"
                                }`}>
                                  {student.status === "completed" ? "Concluído" : student.status === "inactive" ? "Inativo" : "Ativo"}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-[11px] text-gray-500 flex-wrap">
                                {student.email && <span>{student.email}</span>}
                                {student.studentIdNumber && <span>Matrícula: {student.studentIdNumber}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <select
                                value={student.status}
                                onChange={(e) => void handleUpdateStudentStatus(student.id, e.target.value)}
                                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-[11px] font-bold text-gray-700 dark:text-gray-300 focus:outline-none"
                              >
                                <option value="active">Ativo</option>
                                <option value="completed">Concluído</option>
                                <option value="inactive">Inativo</option>
                              </select>
                              <Link
                                href={`/professor/boletim/${student.id}`}
                                className="px-2.5 py-1.5 rounded-xl bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white transition text-[11px] font-bold flex items-center gap-1"
                                title="Ver Boletim Consolidado"
                              >
                                Boletim
                              </Link>
                              <button
                                type="button"
                                onClick={() => startEditStudent(student, cls.id)}
                                className="p-1.5 rounded-xl text-gray-500 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                                title="Editar aluno"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleDeleteStudent(student.id)}
                                className="p-1.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                                title="Remover aluno"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
