"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Building2, Plus, Trash2, Users, Loader2, AlertCircle, Search, Edit3, X, FileSpreadsheet, BarChart3, CheckCircle2, Award, FileText, Calendar, Mail } from "lucide-react";
import { toast } from "sonner";

interface ExternalStudentItem {
  id: number;
  name: string;
  email: string | null;
  studentIdNumber: string | null;
  status: string;
  notes: string | null;
}

interface ExternalClassAttendanceItem {
  id: number;
  date: string;
  attendanceData: string;
  createdAt: string;
}

interface ExternalClassGradeItem {
  id: number;
  studentId: number;
  assessmentTitle: string;
  score: string;
  maxScore: string;
  feedback: string | null;
  createdAt: string;
}

interface ExternalClassMaterialItem {
  id: number;
  title: string;
  fileUrl: string;
  description: string | null;
  createdAt: string;
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
  attendance?: ExternalClassAttendanceItem[];
  grades?: ExternalClassGradeItem[];
  materials?: ExternalClassMaterialItem[];
  stats?: ExternalClassStats;
}

type ClassFormField = "institution" | "className" | "courseName" | "academicTerm" | "description";
type ClassFormErrors = Partial<Record<ClassFormField, string>>;

export default function TurmasExternasPage() {
  const [classes, setClasses] = useState<ExternalClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<{ status?: number; title: string; message: string; action?: string } | null>(null);
  const [operationFeedback, setOperationFeedback] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sendingEmailId, setSendingEmailId] = useState<number | null>(null);

  const describeApiError = (status: number, fallback: string) => {
    if (status === 401) return { title: "Sessão necessária", message: "Sua sessão não está ativa. Entre novamente para acessar as turmas externas.", action: "Fazer login" };
    if (status === 403) return { title: "Acesso não autorizado", message: "Sua conta não possui permissão para gerenciar esta área. Use uma conta de professor ou administrador aprovada." };
    if (status === 404) return { title: "Recurso não encontrado", message: "A turma ou o registro solicitado não existe mais. Atualize a página para sincronizar os dados." };
    if (status >= 500) return { title: "Falha temporária no servidor", message: "O servidor não conseguiu concluir a consulta. Tente novamente em alguns instantes; nenhum dado foi inventado ou alterado." };
    return { title: "Não foi possível concluir", message: fallback };
  };

  const notifySuccess = (message: string) => {
    setOperationFeedback({ type: "success", message });
    toast.success(message);
  };

  const notifyError = (message: string) => {
    setOperationFeedback({ type: "error", message });
    toast.error(message);
  };

  const handleSendWelcomeEmail = async (studentId: number, studentName: string) => {
    try {
      setSendingEmailId(studentId);
      const res = await fetch("/api/professor/external-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sendWelcomeEmail", studentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao enviar e-mail de boas-vindas.");
      notifySuccess(`E-mail de boas-vindas enviado para ${studentName}!`);
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Erro ao enviar e-mail.");
    } finally {
      setSendingEmailId(null);
    }
  };
  const [classPendingDeletion, setClassPendingDeletion] = useState<ExternalClassItem | null>(null);
  const [deletingClassId, setDeletingClassId] = useState<number | null>(null);

  // Search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInstitutionFilter, setSelectedInstitutionFilter] = useState("all");
  const [studentStatusFilter, setStudentStatusFilter] = useState("all");
  const [selectedYearFilter, setSelectedYearFilter] = useState("all");
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState("all");

  // Edit class mode
  const [editingClassId, setEditingClassId] = useState<number | null>(null);

  // Edit student mode
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);

  // Form states for creating/editing class
  const [institution, setInstitution] = useState("SIMAL");
  const [customInstitutionInput, setCustomInstitutionInput] = useState("");
  const [isCustomInstitution, setIsCustomInstitution] = useState(false);
  const [className, setClassName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [academicTerm, setAcademicTerm] = useState("2026.1");
  const [description, setDescription] = useState("");
  const [touchedClassFields, setTouchedClassFields] = useState<Partial<Record<ClassFormField, boolean>>>({});

  const finalInstitutionValue = isCustomInstitution ? customInstitutionInput.trim() : institution.trim();

  const validateClassForm = (): ClassFormErrors => {
    const errors: ClassFormErrors = {};
    if (!finalInstitutionValue) errors.institution = "Informe a instituição ou o programa da turma.";
    if (className.trim().length < 3) errors.className = "Informe o nome da turma com pelo menos 3 caracteres.";
    if (courseName.trim().length < 3) errors.courseName = "Informe a disciplina ou curso com pelo menos 3 caracteres.";
    if (!/^(19|20)\d{2}[./-][12]$/.test(academicTerm.trim())) errors.academicTerm = "Use o formato ano.semestre, por exemplo: 2026.1 ou 2026.2.";
    if (description.trim().length > 1000) errors.description = "A descrição deve ter no máximo 1.000 caracteres.";
    return errors;
  };

  const classFormErrors = useMemo(() => validateClassForm(), [finalInstitutionValue, className, courseName, academicTerm, description]);
  const classFormIsValid = Object.keys(classFormErrors).length === 0;

  const classFieldClassName = (field: ClassFormField) => {
    const hasError = Boolean(touchedClassFields[field] && classFormErrors[field]);
    const isValid = Boolean(touchedClassFields[field] && !classFormErrors[field]);
    return `w-full rounded-xl border bg-gray-50 dark:bg-slate-800 p-3 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600 ${hasError ? "border-red-500 focus:ring-red-500" : isValid ? "border-green-500 focus:ring-green-500" : "border-gray-200 dark:border-slate-800"}`;
  };

  const renderClassFieldMessage = (field: ClassFormField) => {
    if (!touchedClassFields[field]) return null;
    if (classFormErrors[field]) {
      return <p id={`class-${field}-error`} className="mt-1 text-[11px] font-semibold text-red-600 dark:text-red-400" role="alert">{classFormErrors[field]}</p>;
    }
    return <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-green-600 dark:text-green-400"><CheckCircle2 size={12} aria-hidden="true" /> Campo válido</p>;
  };

  const markClassFieldTouched = (field: ClassFormField) => {
    setTouchedClassFields((current) => ({ ...current, [field]: true }));
  };

  const resetClassValidation = () => setTouchedClassFields({});

  // Form states for adding/editing student
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentIdNumber, setStudentIdNumber] = useState("");
  const [studentStatus, setStudentStatus] = useState("active");
  const [studentNotes, setStudentNotes] = useState("");

  // Tab view per class: 'students' | 'attendance' | 'grades' | 'materials'
  const [activeTabByClass, setActiveTabByClass] = useState<Record<number, string>>({});

  // Chamada state
  const [attendanceDate, setAttendanceDate] = useState<Record<number, string>>({});
  const [attendanceStatuses, setAttendanceStatuses] = useState<Record<number, Record<number, string>>>({});

  // Grades state
  const [gradeAssessmentTitle, setGradeAssessmentTitle] = useState<Record<number, string>>({});
  const [gradeStudentId, setGradeStudentId] = useState<Record<number, number>>({});
  const [gradeScore, setGradeScore] = useState<Record<number, string>>({});
  const [gradeFeedback, setGradeFeedback] = useState<Record<number, string>>({});

  // Materials state
  const [materialTitle, setMaterialTitle] = useState<Record<number, string>>({});
  const [materialFileUrl, setMaterialFileUrl] = useState<Record<number, string>>({});
  const [materialDescription, setMaterialDescription] = useState<Record<number, string>>({});

  const loadClasses = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const res = await fetch("/api/professor/external-classes", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const description = describeApiError(res.status, data.error || "Erro ao carregar turmas externas.");
        setLoadError({ status: res.status, ...description });
        throw new Error(description.message);
      }
      setClasses(Array.isArray(data.classes) ? data.classes : []);
      setOperationFeedback(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro inesperado ao carregar turmas externas.";
      setLoadError((current) => current ?? { title: "Não foi possível carregar as turmas", message });
      notifyError(message);
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

  const uniqueInstitutions = useMemo(() => {
    const instSet = new Set<string>();
    classes.forEach(c => instSet.add(c.institution));
    return Array.from(instSet);
  }, [classes]);

  const uniqueYears = useMemo(() => {
    const yearSet = new Set<string>();
    classes.forEach(c => {
      const match = c.academicTerm?.match(/(?:19|20)\d{2}/);
      if (match) yearSet.add(match[0]);
    });
    return Array.from(yearSet).sort().reverse();
  }, [classes]);

  const filteredClasses = useMemo(() => {
    return classes.map((cls) => {
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
      
      const termYear = cls.academicTerm || "";
      const matchesYear = selectedYearFilter === "all" || termYear.includes(selectedYearFilter);
      const matchesSemester = selectedSemesterFilter === "all" || termYear.includes(`.${selectedSemesterFilter}`) || termYear.includes(`/${selectedSemesterFilter}`) || termYear.includes(`-${selectedSemesterFilter}`) || termYear.toLowerCase().includes(`${selectedSemesterFilter}º`);

      const term = searchTerm.toLowerCase();
      const matchesClassSearch = !term || cls.className.toLowerCase().includes(term) || cls.courseName.toLowerCase().includes(term) || cls.institution.toLowerCase().includes(term);
      const hasMatchingStudents = cls.filteredStudents.length > 0;
      return matchesInstitution && matchesYear && matchesSemester && (matchesClassSearch || hasMatchingStudents);
    });
  }, [classes, selectedInstitutionFilter, studentStatusFilter, selectedYearFilter, selectedSemesterFilter, searchTerm]);

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouchedClassFields({ institution: true, className: true, courseName: true, academicTerm: true, description: true });
    const validationErrors = validateClassForm();
    const finalInstitution = finalInstitutionValue;
    if (Object.keys(validationErrors).length > 0) {
      notifyError("Revise os campos destacados antes de salvar a turma.");
      return;
    }
    try {
      setSubmitting(true);
      const action = editingClassId ? "updateClass" : "createClass";
      const body = editingClassId
        ? { action, classId: editingClassId, institution: finalInstitution, className, courseName, academicTerm, description }
        : { action, institution: finalInstitution, className, courseName, academicTerm, description };

      const res = await fetch("/api/professor/external-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar turma.");
      notifySuccess(editingClassId ? "Turma atualizada com sucesso!" : "Turma externa criada com sucesso!");
      resetClassForm();
      void loadClasses();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Erro ao salvar turma.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEditClass = (cls: ExternalClassItem) => {
    setEditingClassId(cls.id);
    const standardList = ["IsF", "PROFICI", "SIMAL", "Megaworks", "UFBA"];
    if (standardList.includes(cls.institution)) {
      setInstitution(cls.institution);
      setIsCustomInstitution(false);
      setCustomInstitutionInput("");
    } else {
      setInstitution("Outro");
      setIsCustomInstitution(true);
      setCustomInstitutionInput(cls.institution);
    }
    setClassName(cls.className);
    setCourseName(cls.courseName);
    setAcademicTerm(cls.academicTerm);
    setDescription(cls.description || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetClassForm = () => {
    setEditingClassId(null);
    setInstitution("SIMAL");
    setCustomInstitutionInput("");
    setIsCustomInstitution(false);
    setClassName("");
    setCourseName("");
    setAcademicTerm("2026.1");
    setDescription("");
    resetClassValidation();
  };

  const handleDeleteClass = (classId: number) => {
    const selectedClass = classes.find((item) => item.id === classId);
    if (!selectedClass) {
      notifyError("Turma externa não encontrada. Atualize a página e tente novamente.");
      return;
    }
    setClassPendingDeletion(selectedClass);
  };

  const confirmDeleteClass = async () => {
    if (!classPendingDeletion) return;
    const classId = classPendingDeletion.id;
    try {
      setDeletingClassId(classId);
      const res = await fetch("/api/professor/external-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteClass", classId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao excluir turma.");
      const summary = data.deletedSummary;
      if (summary) {
        notifySuccess(`Turma '${summary.className}' excluída. Removidos: ${summary.students} aluno(s), ${summary.attendance} chamada(s), ${summary.grades} nota(s) e ${summary.materials} material(is).`);
      } else {
        notifySuccess("Turma externa excluída com sucesso.");
      }
      setClassPendingDeletion(null);
      void loadClasses();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Erro ao excluir turma.");
    } finally {
      setDeletingClassId(null);
    }
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !studentName) {
      notifyError("Selecione uma turma e informe o nome do aluno.");
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
      notifySuccess(editingStudentId ? "Dados do aluno atualizados!" : "Aluno matriculado com sucesso!");
      resetStudentForm();
      void loadClasses();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Erro ao salvar aluno.");
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
      notifySuccess("Aluno removido da turma com sucesso.");
      void loadClasses();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Erro ao remover aluno.");
    }
  };

  // Handlers para Chamada, Notas e Materiais
  const handleSaveAttendance = async (classId: number, students: ExternalStudentItem[]) => {
    const date = attendanceDate[classId] || new Date().toISOString().split("T")[0];
    const dataMap = attendanceStatuses[classId] || {};
    const finalMap: Record<number, string> = {};
    for (const s of students) {
      finalMap[s.id] = dataMap[s.id] || "present";
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/professor/external-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "saveAttendance", classId, date, attendanceData: finalMap }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar chamada.");
      notifySuccess("Chamada registrada com sucesso!");
      void loadClasses();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Erro ao salvar chamada.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveGrade = async (classId: number) => {
    const sId = gradeStudentId[classId];
    const title = gradeAssessmentTitle[classId];
    const scoreVal = gradeScore[classId];
    const maxVal = "10.0";
    const fb = gradeFeedback[classId] || "";

    if (!sId || !title || !scoreVal) {
      notifyError("Selecione o aluno, informe o título da avaliação e a nota.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/professor/external-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "saveGrade",
          classId,
          studentId: sId,
          assessmentTitle: title,
          score: scoreVal,
          maxScore: maxVal,
          feedback: fb,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar nota.");
      notifySuccess("Nota lançada com sucesso!");
      setGradeAssessmentTitle(prev => ({ ...prev, [classId]: "" }));
      setGradeScore(prev => ({ ...prev, [classId]: "" }));
      setGradeFeedback(prev => ({ ...prev, [classId]: "" }));
      void loadClasses();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Erro ao salvar nota.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGrade = async (gradeId: number) => {
    if (!window.confirm("Deseja realmente excluir esta nota?")) return;
    try {
      const res = await fetch("/api/professor/external-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteGrade", gradeId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao excluir nota.");
      notifySuccess("Nota excluída com sucesso.");
      void loadClasses();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Erro ao excluir nota.");
    }
  };

  const handleAddMaterial = async (classId: number) => {
    const title = materialTitle[classId];
    const url = materialFileUrl[classId];
    const desc = materialDescription[classId] || "";

    if (!title || !url) {
      notifyError("Informe o título e o link/URL do material.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/professor/external-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addMaterial",
          classId,
          materialTitle: title,
          fileUrl: url,
          materialDescription: desc,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao adicionar material.");
      notifySuccess("Material vinculado à turma com sucesso!");
      setMaterialTitle(prev => ({ ...prev, [classId]: "" }));
      setMaterialFileUrl(prev => ({ ...prev, [classId]: "" }));
      setMaterialDescription(prev => ({ ...prev, [classId]: "" }));
      void loadClasses();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Erro ao adicionar material.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMaterial = async (materialId: number) => {
    if (!window.confirm("Deseja realmente remover este material da turma?")) return;
    try {
      const res = await fetch("/api/professor/external-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deleteMaterial", materialId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao excluir material.");
      notifySuccess("Material removido com sucesso.");
      void loadClasses();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Erro ao excluir material.");
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
          notifyError("O arquivo CSV precisa de um cabeçalho e ao menos uma linha de dados.");
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
          notifyError("Nenhum aluno válido encontrado no arquivo CSV.");
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
        notifySuccess(`${data.importedCount} alunos importados com sucesso via CSV!`);
        void loadClasses();
      } catch (err) {
        notifyError(err instanceof Error ? err.message : "Erro ao processar arquivo CSV.");
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
                <Building2 className="text-red-600" size={26} /> Gestão Completa de Cursos, Chamada, Notas e Materiais Externos
              </h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 pl-13">
              Controle total de turmas institucionais e customizadas (IsF, PROFICI, SIMAL, Megaworks, UFBA e outras), chamada diária, notas, feedbacks e repositório de materiais.
            </p>
          </div>
        </header>

        {loadError && (
          <section
            role="alert"
            aria-live="assertive"
            className="rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-3"
          >
            <div className="shrink-0 rounded-xl bg-red-100 dark:bg-red-950/70 p-2 text-red-700 dark:text-red-300">
              <AlertCircle size={20} aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <h2 className="text-sm font-black text-red-900 dark:text-red-200">{loadError.title}</h2>
              <p className="text-xs leading-relaxed text-red-800 dark:text-red-300">{loadError.message}</p>
              {loadError.status && <p className="text-[11px] font-semibold text-red-700/80 dark:text-red-300/80">Código de resposta: {loadError.status}</p>}
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => void loadClasses()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
                >
                  <Loader2 size={13} aria-hidden="true" /> Tentar novamente
                </button>
                {loadError.action === "Fazer login" && (
                  <Link
                    href="/login"
                    className="inline-flex items-center rounded-lg border border-red-300 dark:border-red-800 px-3 py-2 text-xs font-bold text-red-800 dark:text-red-200 transition hover:bg-red-100 dark:hover:bg-red-950/60 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
                  >
                    Fazer login
                  </Link>
                )}
              </div>
            </div>
          </section>
        )}

        {operationFeedback && !loadError && (
          <div
            role={operationFeedback.type === "error" ? "alert" : "status"}
            aria-live="polite"
            className={`rounded-2xl border p-3 flex items-start gap-3 ${
              operationFeedback.type === "success"
                ? "border-green-200 bg-green-50 text-green-900 dark:border-green-900/60 dark:bg-green-950/30 dark:text-green-200"
                : operationFeedback.type === "info"
                  ? "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200"
                  : "border-red-200 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200"
            }`}
          >
            {operationFeedback.type === "success" ? <CheckCircle2 size={17} className="mt-0.5 shrink-0" aria-hidden="true" /> : <AlertCircle size={17} className="mt-0.5 shrink-0" aria-hidden="true" />}
            <p className="flex-1 text-xs font-semibold leading-relaxed">{operationFeedback.message}</p>
            <button type="button" onClick={() => setOperationFeedback(null)} className="rounded-md p-1 opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current" aria-label="Fechar mensagem">
              <X size={15} aria-hidden="true" />
            </button>
          </div>
        )}

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
              <span className="text-xs font-bold text-gray-500 whitespace-nowrap">Ano:</span>
              <select
                value={selectedYearFilter}
                onChange={(e) => setSelectedYearFilter(e.target.value)}
                className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none"
              >
                <option value="all">Todos os Anos</option>
                {uniqueYears.map((yr) => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 whitespace-nowrap">Semestre:</span>
              <select
                value={selectedSemesterFilter}
                onChange={(e) => setSelectedSemesterFilter(e.target.value)}
                className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none"
              >
                <option value="all">Todos</option>
                <option value="1">1º Semestre</option>
                <option value="2">2º Semestre</option>
              </select>
            </div>

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
              <button
                type="button"
                onClick={() => setSelectedInstitutionFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  selectedInstitutionFilter === "all"
                    ? "bg-red-600 text-white shadow-xs"
                    : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                }`}
              >
                Todas
              </button>
              {uniqueInstitutions.map((inst) => (
                <button
                  key={inst}
                  type="button"
                  onClick={() => setSelectedInstitutionFilter(inst)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    selectedInstitutionFilter.toLowerCase() === inst.toLowerCase()
                      ? "bg-red-600 text-white shadow-xs"
                      : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {inst}
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
                    aria-invalid={Boolean(touchedClassFields.institution && classFormErrors.institution)}
                    aria-describedby={touchedClassFields.institution && classFormErrors.institution ? "class-institution-error" : undefined}
                    onBlur={() => markClassFieldTouched("institution")}
                    onChange={(e) => {
                      const val = e.target.value;
                      setInstitution(val);
                      setIsCustomInstitution(val === "Outro");
                      markClassFieldTouched("institution");
                    }}
                    className={`${classFieldClassName("institution")} mb-2`}
                  >
                    <option value="IsF">IsF (Idioma sem Fronteiras)</option>
                    <option value="PROFICI">PROFICI</option>
                    <option value="SIMAL">Projeto SIMAL</option>
                    <option value="Megaworks">Megaworks</option>
                    <option value="UFBA">UFBA (Universidade)</option>
                    <option value="Outro">Outra Instituição (Digitar Nova)</option>
                  </select>
                  {isCustomInstitution && (
                    <input
                      type="text"
                      placeholder="Digite o nome da nova instituição ou programa..."
                      value={customInstitutionInput}
                      onChange={(e) => {
                        setCustomInstitutionInput(e.target.value);
                        markClassFieldTouched("institution");
                      }}
                      onBlur={() => markClassFieldTouched("institution")}
                      aria-invalid={Boolean(touchedClassFields.institution && classFormErrors.institution)}
                      aria-describedby={touchedClassFields.institution && classFormErrors.institution ? "class-institution-error" : undefined}
                      className={classFieldClassName("institution")}
                      required
                    />
                  )}
                  {renderClassFieldMessage("institution")}
                </div>
                <div>
                  <label htmlFor="external-class-name" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Nome da Turma</label>
                  <input
                    id="external-class-name"
                    type="text"
                    placeholder="Ex: Turma Leitura Instrumental A"
                    value={className}
                    onBlur={() => markClassFieldTouched("className")}
                    onChange={(e) => {
                      setClassName(e.target.value);
                      markClassFieldTouched("className");
                    }}
                    aria-invalid={Boolean(touchedClassFields.className && classFormErrors.className)}
                    aria-describedby={touchedClassFields.className && classFormErrors.className ? "class-className-error" : undefined}
                    className={classFieldClassName("className")}
                  />
                  {renderClassFieldMessage("className")}
                </div>
                <div>
                  <label htmlFor="external-course-name" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Curso / Disciplina</label>
                  <input
                    id="external-course-name"
                    type="text"
                    placeholder="Ex: Inglês Instrumental para Pós-Graduação"
                    value={courseName}
                    onBlur={() => markClassFieldTouched("courseName")}
                    onChange={(e) => {
                      setCourseName(e.target.value);
                      markClassFieldTouched("courseName");
                    }}
                    aria-invalid={Boolean(touchedClassFields.courseName && classFormErrors.courseName)}
                    aria-describedby={touchedClassFields.courseName && classFormErrors.courseName ? "class-courseName-error" : undefined}
                    className={classFieldClassName("courseName")}
                  />
                  {renderClassFieldMessage("courseName")}
                </div>
                <div>
                  <label htmlFor="external-academic-term" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Período Letivo</label>
                  <input
                    id="external-academic-term"
                    type="text"
                    inputMode="numeric"
                    placeholder="Ex: 2026.1"
                    value={academicTerm}
                    onBlur={() => markClassFieldTouched("academicTerm")}
                    onChange={(e) => {
                      setAcademicTerm(e.target.value);
                      markClassFieldTouched("academicTerm");
                    }}
                    aria-invalid={Boolean(touchedClassFields.academicTerm && classFormErrors.academicTerm)}
                    aria-describedby={touchedClassFields.academicTerm && classFormErrors.academicTerm ? "class-academicTerm-error" : undefined}
                    className={classFieldClassName("academicTerm")}
                  />
                  {renderClassFieldMessage("academicTerm")}
                </div>
                <div>
                  <label htmlFor="external-class-description" className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Observações / Descrição <span className="font-normal text-gray-400">(opcional)</span></label>
                  <textarea
                    id="external-class-description"
                    placeholder="Informações adicionais..."
                    value={description}
                    maxLength={1000}
                    onBlur={() => markClassFieldTouched("description")}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      markClassFieldTouched("description");
                    }}
                    aria-invalid={Boolean(touchedClassFields.description && classFormErrors.description)}
                    aria-describedby={touchedClassFields.description && classFormErrors.description ? "class-description-error" : undefined}
                    rows={2}
                    className={`${classFieldClassName("description")} resize-none`}
                  />
                  <div className="mt-1 flex items-center justify-between gap-2">
                    {renderClassFieldMessage("description")}
                    <span className={`ml-auto text-[10px] font-semibold ${description.length > 1000 ? "text-red-600" : "text-gray-400"}`}>{description.length}/1000</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting || (Object.keys(touchedClassFields).length > 0 && !classFormIsValid)}
                  aria-disabled={submitting || !classFormIsValid}
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
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

          {/* Listagem de Turmas, Abas e Gerenciamento */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              <div className="py-24 text-center text-gray-400 text-xs font-semibold flex flex-col items-center justify-center gap-3">
                <Loader2 size={24} className="animate-spin text-red-600" /> Carregando turmas e dados acadêmicos...
              </div>
            ) : loadError ? (
              <div className="rounded-3xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 p-8 text-center space-y-2">
                <AlertCircle size={28} className="mx-auto text-red-500" />
                <h3 className="text-sm font-bold text-red-900 dark:text-red-200">Não foi possível carregar as turmas</h3>
                <p className="text-xs text-red-700 dark:text-red-300 max-w-sm mx-auto">{loadError.message}</p>
                <button
                  type="button"
                  onClick={() => void loadClasses()}
                  className="mt-2 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition"
                >
                  Tentar novamente
                </button>
              </div>
            ) : filteredClasses.length === 0 ? (
              <div
                role="status"
                aria-live="polite"
                className="rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-12 text-center space-y-3"
              >
                <AlertCircle size={32} className="mx-auto text-gray-400" aria-hidden="true" />
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  {classes.length === 0 ? "Nenhuma turma externa cadastrada" : "Nenhuma turma corresponde aos filtros"}
                </h3>
                <p className="text-xs leading-relaxed text-gray-500 max-w-md mx-auto">
                  {classes.length === 0
                    ? "A consulta foi concluída, mas o banco não retornou turmas para esta conta. Cadastre a primeira turma usando o formulário ao lado."
                    : "Os registros existem, mas nenhum atende à busca, instituição, ano, semestre ou status selecionado. Limpe os filtros e tente novamente."}
                </p>
                {classes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedInstitutionFilter("all");
                      setStudentStatusFilter("all");
                      setSelectedYearFilter("all");
                      setSelectedSemesterFilter("all");
                    }}
                    className="inline-flex items-center rounded-lg border border-gray-300 dark:border-slate-700 px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            ) : (
              filteredClasses.map((cls) => {
                const activeTab = activeTabByClass[cls.id] || "students";
                const classDate = attendanceDate[cls.id] || new Date().toISOString().split("T")[0];
                const currentStatuses = attendanceStatuses[cls.id] || {};

                return (
                  <div key={cls.id} className="rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            aria-label="Origem: Turma externa institucional"
                            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                          >
                            <Building2 size={12} aria-hidden="true" /> Turma externa
                          </span>
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
                          <FileSpreadsheet size={14} className="text-green-600" /> CSV
                          <input
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={(e) => void handleCsvImport(cls.id, e)}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            // Exportar CSV da Turma (Alunos, Notas e Frequência)
                            const rows = [
                              ["Relatorio da Turma Externa"],
                              ["Instituição", cls.institution],
                              ["Turma", cls.className],
                              ["Curso", cls.courseName],
                              ["Período", cls.academicTerm],
                              [],
                              ["ID Aluno", "Nome", "E-mail", "Matrícula", "Status", "Notas Cadastradas"]
                            ];
                            cls.students.forEach(st => {
                              const studentGrades = (cls.grades || []).filter(g => g.studentId === st.id).map(g => `${g.assessmentTitle}: ${g.score}/${g.maxScore}`).join("; ");
                              rows.push([String(st.id), st.name, st.email || "", st.studentIdNumber || "", st.status, studentGrades]);
                            });
                            const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
                            const encodedUri = encodeURI(csvContent);
                            const link = document.createElement("a");
                            link.setAttribute("href", encodedUri);
                            link.setAttribute("download", `relatorio_turma_${cls.id}_${cls.className.replace(/\s+/g, "_")}.csv`);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            notifySuccess("Relatório CSV exportado com sucesso!");
                          }}
                          className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition flex items-center gap-1.5 text-gray-700 dark:text-gray-300"
                          title="Exportar CSV da Turma"
                        >
                          <FileSpreadsheet size={14} className="text-green-600" /> Exportar CSV
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // Exportar Relatório em PDF via janela de impressão formatada
                            const printWindow = window.open("", "_blank");
                            if (!printWindow) {
                              notifyError("Permita popups no navegador para gerar o PDF.");
                              return;
                            }
                            const gradesHtml = (cls.grades || []).map(g => {
                              const st = cls.students.find(s => s.id === g.studentId);
                              return `<tr><td style="padding: 8px; border-bottom: 1px solid #ddd;">${st ? st.name : "Aluno"}</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${g.assessmentTitle}</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${g.score} / ${g.maxScore}</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${g.feedback || "-"}</td></tr>`;
                            }).join("");

                            const studentsHtml = cls.students.map(st => `<tr><td style="padding: 8px; border-bottom: 1px solid #ddd;">${st.name}</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${st.email || "-"}</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${st.studentIdNumber || "-"}</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${st.status}</td></tr>`).join("");

                            printWindow.document.write(`
                              <html>
                                <head>
                                  <title>Relatório Acadêmico - ${cls.className}</title>
                                  <style>
                                    body { font-family: Arial, sans-serif; margin: 30px; color: #111; }
                                    h1 { color: #dc2626; font-size: 20px; margin-bottom: 4px; }
                                    h2 { font-size: 14px; margin-top: 20px; border-bottom: 2px solid #dc2626; padding-bottom: 4px; }
                                    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
                                    th { background: #f3f4f6; padding: 8px; text-align: left; border-bottom: 2px solid #ccc; }
                                    .meta { background: #f9fafb; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 12px; }
                                  </style>
                                </head>
                                <body>
                                  <h1>Plataforma Anderson Palafoz - Relatório Acadêmico</h1>
                                  <div class="meta">
                                    <strong>Instituição:</strong> ${cls.institution} | <strong>Turma:</strong> ${cls.className}<br/>
                                    <strong>Curso:</strong> ${cls.courseName} | <strong>Período:</strong> ${cls.academicTerm}<br/>
                                    <strong>Total de Alunos:</strong> ${cls.students.length} | <strong>Data de Emissão:</strong> ${new Date().toLocaleDateString("pt-BR")}
                                  </div>
                                  <h2>Alunos Matriculados</h2>
                                  <table>
                                    <thead><tr><th>Nome</th><th>E-mail</th><th>Matrícula</th><th>Status</th></tr></thead>
                                    <tbody>${studentsHtml || '<tr><td colspan="4">Nenhum aluno cadastrado.</td></tr>'}</tbody>
                                  </table>
                                  <h2>Notas e Avaliações Lançadas</h2>
                                  <table>
                                    <thead><tr><th>Aluno</th><th>Avaliação</th><th>Nota</th><th>Feedback</th></tr></thead>
                                    <tbody>${gradesHtml || '<tr><td colspan="4">Nenhuma nota lançada.</td></tr>'}</tbody>
                                  </table>
                                  <script>window.onload = function() { window.print(); }</script>
                                </body>
                              </html>
                            `);
                            printWindow.document.close();
                            notifySuccess("Gerando PDF para impressão/download...");
                          }}
                          className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition flex items-center gap-1.5 text-gray-700 dark:text-gray-300"
                          title="Exportar Relatório PDF"
                        >
                          <FileText size={14} className="text-red-600" /> Exportar PDF
                        </button>
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
                          aria-haspopup="dialog"
                          aria-label={`Abrir confirmação para excluir a turma ${cls.className}`}
                          className="px-3 py-2 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 text-xs font-bold hover:bg-red-100 transition text-red-700 dark:text-red-300 flex items-center gap-1.5"
                        >
                          <Trash2 size={14} /> Excluir
                        </button>
                      </div>
                    </div>

                    {/* Resumo estatístico da turma */}
                    {cls.stats && (
                      <div className="grid grid-cols-4 gap-3 bg-gray-50 dark:bg-slate-800/50 p-3 rounded-2xl text-center">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Alunos</p>
                          <p className="text-sm font-black text-gray-900 dark:text-white mt-0.5">{cls.stats.total}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-green-600">Ativos</p>
                          <p className="text-sm font-black text-green-600 mt-0.5">{cls.stats.active}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Notas</p>
                          <p className="text-sm font-black text-blue-600 mt-0.5">{cls.grades?.length || 0}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Materiais</p>
                          <p className="text-sm font-black text-amber-600 mt-0.5">{cls.materials?.length || 0}</p>
                        </div>
                      </div>
                    )}

                    {/* Navegação por Abas (Alunos, Chamada, Notas, Materiais) */}
                    <div className="flex border-b border-gray-200 dark:border-slate-800 gap-2 overflow-x-auto">
                      <button
                        type="button"
                        onClick={() => setActiveTabByClass({ ...activeTabByClass, [cls.id]: "students" })}
                        className={`pb-2.5 px-3 text-xs font-bold whitespace-nowrap border-b-2 transition flex items-center gap-1.5 ${
                          activeTab === "students"
                            ? "border-red-600 text-red-600 dark:text-red-400"
                            : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        <Users size={14} /> Alunos ({cls.students.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTabByClass({ ...activeTabByClass, [cls.id]: "attendance" })}
                        className={`pb-2.5 px-3 text-xs font-bold whitespace-nowrap border-b-2 transition flex items-center gap-1.5 ${
                          activeTab === "attendance"
                            ? "border-red-600 text-red-600 dark:text-red-400"
                            : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        <Calendar size={14} /> Chamada ({cls.attendance?.length || 0})
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTabByClass({ ...activeTabByClass, [cls.id]: "grades" })}
                        className={`pb-2.5 px-3 text-xs font-bold whitespace-nowrap border-b-2 transition flex items-center gap-1.5 ${
                          activeTab === "grades"
                            ? "border-red-600 text-red-600 dark:text-red-400"
                            : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        <Award size={14} /> Notas & Avaliações ({cls.grades?.length || 0})
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTabByClass({ ...activeTabByClass, [cls.id]: "materials" })}
                        className={`pb-2.5 px-3 text-xs font-bold whitespace-nowrap border-b-2 transition flex items-center gap-1.5 ${
                          activeTab === "materials"
                            ? "border-red-600 text-red-600 dark:text-red-400"
                            : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        <FileText size={14} /> Materiais Didáticos ({cls.materials?.length || 0})
                      </button>
                    </div>

                    {/* CONTEÚDO DA ABA: ALUNOS */}
                    {activeTab === "students" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-400">
                            Matriculados ({cls.filteredStudents.length})
                          </h4>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedClassId(cls.id);
                              window.scrollTo({ top: 400, behavior: "smooth" });
                            }}
                            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                          >
                            <Plus size={14} /> Adicionar Aluno
                          </button>
                        </div>
                        {cls.filteredStudents.length === 0 ? (
                          <p className="text-xs text-gray-400 py-4 text-center">Nenhum aluno cadastrado nesta turma ou correspondente ao filtro.</p>
                        ) : (
                          <div className="divide-y divide-gray-100 dark:divide-slate-800">
                            {cls.filteredStudents.map((st) => (
                              <div key={st.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm text-gray-900 dark:text-white">{st.name}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                                      st.status === "active" ? "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300" :
                                      st.status === "completed" ? "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300" :
                                      "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400"
                                    }`}>
                                      {st.status === "active" ? "Ativo" : st.status === "completed" ? "Concluído" : "Inativo"}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {st.email || "Sem e-mail"} {st.studentIdNumber ? `• Matrícula: ${st.studentIdNumber}` : ""}
                                  </p>
                                  {st.notes && <p className="text-xs text-gray-400 italic mt-1">Obs: {st.notes}</p>}
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {st.email && (
                                    <button
                                      type="button"
                                      disabled={sendingEmailId === st.id}
                                      onClick={() => void handleSendWelcomeEmail(st.id, st.name)}
                                      className="px-2.5 py-1.5 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-xs font-bold hover:bg-red-100 transition text-red-700 dark:text-red-300 flex items-center gap-1"
                                      title="Enviar e-mail de boas-vindas para o aluno"
                                    >
                                      {sendingEmailId === st.id ? <Loader2 size={12} className="animate-spin" /> : <Mail size={12} />}
                                      Boas-vindas
                                    </button>
                                  )}
                                  <Link
                                    href={`/professor/boletim/${st.id}`}
                                    className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-xs font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition text-gray-700 dark:text-gray-300"
                                    title="Ver Boletim Consolidado"
                                  >
                                    Boletim
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => startEditStudent(st, cls.id)}
                                    className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                                    title="Editar Aluno"
                                  >
                                    <Edit3 size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteStudent(st.id)}
                                    className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                                    title="Excluir Aluno"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* CONTEÚDO DA ABA: CHAMADA */}
                    {activeTab === "attendance" && (
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 dark:bg-slate-800/40 p-4 rounded-2xl">
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">Nova Chamada / Frequência</h4>
                            <p className="text-[11px] text-gray-500">Selecione a data da aula e marque a presença de cada aluno.</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="date"
                              value={classDate}
                              onChange={(e) => setAttendanceDate({ ...attendanceDate, [cls.id]: e.target.value })}
                              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white"
                            />
                            <button
                              type="button"
                              onClick={() => void handleSaveAttendance(cls.id, cls.students)}
                              disabled={submitting || cls.students.length === 0}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
                            >
                              Salvar Chamada
                            </button>
                          </div>
                        </div>

                        {cls.students.length === 0 ? (
                          <p className="text-xs text-gray-400 py-4 text-center">Cadastre alunos na turma antes de realizar a chamada.</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="border-b border-gray-200 dark:border-slate-800 text-gray-500 font-bold uppercase text-[10px]">
                                  <th className="py-2.5 px-3">Aluno</th>
                                  <th className="py-2.5 px-3 text-center">Presente</th>
                                  <th className="py-2.5 px-3 text-center">Ausente</th>
                                  <th className="py-2.5 px-3 text-center">Atrasado</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                {cls.students.map((st) => {
                                  const studentStatusVal = currentStatuses[st.id] || "present";
                                  return (
                                    <tr key={st.id}>
                                      <td className="py-3 px-3 font-bold text-gray-900 dark:text-white">{st.name}</td>
                                      <td className="py-3 px-3 text-center">
                                        <input
                                          type="radio"
                                          name={`att_${cls.id}_${st.id}`}
                                          checked={studentStatusVal === "present"}
                                          onChange={() => setAttendanceStatuses({
                                            ...attendanceStatuses,
                                            [cls.id]: { ...currentStatuses, [st.id]: "present" }
                                          })}
                                          className="accent-green-600 cursor-pointer"
                                        />
                                      </td>
                                      <td className="py-3 px-3 text-center">
                                        <input
                                          type="radio"
                                          name={`att_${cls.id}_${st.id}`}
                                          checked={studentStatusVal === "absent"}
                                          onChange={() => setAttendanceStatuses({
                                            ...attendanceStatuses,
                                            [cls.id]: { ...currentStatuses, [st.id]: "absent" }
                                          })}
                                          className="accent-red-600 cursor-pointer"
                                        />
                                      </td>
                                      <td className="py-3 px-3 text-center">
                                        <input
                                          type="radio"
                                          name={`att_${cls.id}_${st.id}`}
                                          checked={studentStatusVal === "late"}
                                          onChange={() => setAttendanceStatuses({
                                            ...attendanceStatuses,
                                            [cls.id]: { ...currentStatuses, [st.id]: "late" }
                                          })}
                                          className="accent-amber-600 cursor-pointer"
                                        />
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Histórico de Chamadas Realizadas */}
                        <div className="pt-4 border-t border-gray-100 dark:border-slate-800 space-y-3">
                          <h5 className="text-xs font-black uppercase tracking-wider text-gray-500">Histórico de Chamadas Registradas</h5>
                          {(!cls.attendance || cls.attendance.length === 0) ? (
                            <p className="text-xs text-gray-400">Nenhuma chamada registrada para esta turma ainda.</p>
                          ) : (
                            <div className="space-y-2">
                              {cls.attendance.map((att) => (
                                <div key={att.id} className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle2 size={14} className="text-green-600" />
                                    <span className="font-bold text-gray-900 dark:text-white">Aula em {att.date}</span>
                                  </div>
                                  <span className="text-[10px] text-gray-400">Registrado em {new Date(att.createdAt).toLocaleDateString("pt-BR")}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* CONTEÚDO DA ABA: NOTAS */}
                    {activeTab === "grades" && (
                      <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-slate-800/40 p-4 rounded-2xl space-y-3">
                          <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">Lançar Nova Nota ou Avaliação</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 mb-1">Aluno</label>
                              <select
                                value={gradeStudentId[cls.id] || ""}
                                onChange={(e) => setGradeStudentId({ ...gradeStudentId, [cls.id]: Number(e.target.value) })}
                                className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-gray-900 dark:text-white"
                              >
                                <option value="">-- Aluno --</option>
                                {cls.students.map((st) => (
                                  <option key={st.id} value={st.id}>{st.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 mb-1">Título da Avaliação</label>
                              <input
                                type="text"
                                placeholder="Ex: Prova 1, Quiz Oral..."
                                value={gradeAssessmentTitle[cls.id] || ""}
                                onChange={(e) => setGradeAssessmentTitle({ ...gradeAssessmentTitle, [cls.id]: e.target.value })}
                                className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-gray-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 mb-1">Nota (ex: 9.5)</label>
                              <input
                                type="text"
                                placeholder="9.5"
                                value={gradeScore[cls.id] || ""}
                                onChange={(e) => setGradeScore({ ...gradeScore, [cls.id]: e.target.value })}
                                className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 mb-1">Feedback / Comentário (Opcional)</label>
                            <input
                              type="text"
                              placeholder="Bom desempenho na leitura instrumental..."
                              value={gradeFeedback[cls.id] || ""}
                              onChange={(e) => setGradeFeedback({ ...gradeFeedback, [cls.id]: e.target.value })}
                              className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-gray-900 dark:text-white"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => void handleSaveGrade(cls.id)}
                            disabled={submitting || cls.students.length === 0}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
                          >
                            Salvar Nota
                          </button>
                        </div>

                        {/* Listagem de Notas Lançadas */}
                        <div className="space-y-3">
                          <h5 className="text-xs font-black uppercase tracking-wider text-gray-500">Notas Registradas na Turma</h5>
                          {(!cls.grades || cls.grades.length === 0) ? (
                            <p className="text-xs text-gray-400 py-3 text-center">Nenhuma nota lançada para esta turma ainda.</p>
                          ) : (
                            <div className="divide-y divide-gray-100 dark:divide-slate-800">
                              {cls.grades.map((g) => {
                                const st = cls.students.find(s => s.id === g.studentId);
                                return (
                                  <div key={g.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                                    <div>
                                      <p className="font-bold text-gray-900 dark:text-white">
                                        {st ? st.name : "Aluno ID " + g.studentId} — <span className="text-red-600">{g.assessmentTitle}</span>
                                      </p>
                                      <p className="text-gray-500 mt-0.5">Nota: <strong className="text-gray-900 dark:text-white">{g.score} / {g.maxScore}</strong> {g.feedback ? `• "${g.feedback}"` : ""}</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteGrade(g.id)}
                                      className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 text-red-600 hover:bg-red-50 transition"
                                      title="Excluir Nota"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* CONTEÚDO DA ABA: MATERIAIS */}
                    {activeTab === "materials" && (
                      <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-slate-800/40 p-4 rounded-2xl space-y-3">
                          <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">Vincular Material Didático / Link</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 mb-1">Título do Material</label>
                              <input
                                type="text"
                                placeholder="Ex: Apostila Unidade 1 - PDF"
                                value={materialTitle[cls.id] || ""}
                                onChange={(e) => setMaterialTitle({ ...materialTitle, [cls.id]: e.target.value })}
                                className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-gray-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 mb-1">Link ou URL do Arquivo (Google Drive / S3)</label>
                              <input
                                type="url"
                                placeholder="https://drive.google.com/..."
                                value={materialFileUrl[cls.id] || ""}
                                onChange={(e) => setMaterialFileUrl({ ...materialFileUrl, [cls.id]: e.target.value })}
                                className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 mb-1">Descrição / Instruções (Opcional)</label>
                            <input
                              type="text"
                              placeholder="Leitura obrigatória antes da próxima aula síncrona..."
                              value={materialDescription[cls.id] || ""}
                              onChange={(e) => setMaterialDescription({ ...materialDescription, [cls.id]: e.target.value })}
                              className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-gray-900 dark:text-white"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => void handleAddMaterial(cls.id)}
                            disabled={submitting}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
                          >
                            Adicionar Material
                          </button>
                        </div>

                        {/* Listagem de Materiais */}
                        <div className="space-y-3">
                          <h5 className="text-xs font-black uppercase tracking-wider text-gray-500">Materiais Disponíveis para a Turma</h5>
                          {(!cls.materials || cls.materials.length === 0) ? (
                            <p className="text-xs text-gray-400 py-3 text-center">Nenhum material vinculado a esta turma ainda.</p>
                          ) : (
                            <div className="divide-y divide-gray-100 dark:divide-slate-800">
                              {cls.materials.map((m) => (
                                <div key={m.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                                  <div>
                                    <a
                                      href={m.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-bold text-red-600 hover:underline flex items-center gap-1.5"
                                    >
                                      <FileText size={14} /> {m.title}
                                    </a>
                                    {m.description && <p className="text-gray-500 mt-0.5">{m.description}</p>}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteMaterial(m.id)}
                                    className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 text-red-600 hover:bg-red-50 transition"
                                    title="Remover Material"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {classPendingDeletion && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && deletingClassId === null) setClassPendingDeletion(null);
          }}
        >
          <section
            className="w-full max-w-lg rounded-3xl border border-gray-200 bg-white p-6 text-gray-950 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-white sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-external-class-title"
            aria-describedby="delete-external-class-description"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300">
                  <Trash2 size={20} aria-hidden="true" />
                </div>
                <div>
                  <h2 id="delete-external-class-title" className="text-lg font-black">Excluir turma externa?</h2>
                  <p id="delete-external-class-description" className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">Esta ação é permanente e remove os registros acadêmicos associados.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setClassPendingDeletion(null)}
                disabled={deletingClassId !== null}
                className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label="Fechar confirmação"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/60 dark:bg-red-950/30">
              <p className="font-bold text-red-900 dark:text-red-100">{classPendingDeletion.className}</p>
              <p className="mt-1 text-xs font-semibold text-red-800 dark:text-red-200">{classPendingDeletion.institution} · {classPendingDeletion.courseName} · {classPendingDeletion.academicTerm}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-red-900 dark:text-red-100 sm:grid-cols-4">
                <span><strong>{classPendingDeletion.students.length}</strong> aluno(s)</span>
                <span><strong>{classPendingDeletion.attendance?.length || 0}</strong> chamada(s)</span>
                <span><strong>{classPendingDeletion.grades?.length || 0}</strong> nota(s)</span>
                <span><strong>{classPendingDeletion.materials?.length || 0}</strong> material(is)</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setClassPendingDeletion(null)}
                disabled={deletingClassId !== null}
                className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50 dark:border-slate-600 dark:text-gray-200 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void confirmDeleteClass()}
                disabled={deletingClassId !== null}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
              >
                {deletingClassId !== null ? <Loader2 className="animate-spin" size={16} aria-hidden="true" /> : <Trash2 size={16} aria-hidden="true" />}
                {deletingClassId !== null ? "Excluindo..." : "Excluir definitivamente"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
