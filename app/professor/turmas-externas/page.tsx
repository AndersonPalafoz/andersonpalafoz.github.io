"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import * as XLSX from "xlsx";
import Link from "next/link";
import { AcademicReportFilter, REPORT_MIN_GRADE, REPORT_MIN_ATTENDANCE, academicReportFilterLabel, filterAcademicReportRows, hasFailedByGrade, hasFailedByAttendance, summarizeAcademicReportRows } from "@/lib/external-academic-report";
import { ArrowLeft, BookOpen, Building2, Plus, Trash2, Users, Loader2, AlertCircle, Search, Edit3, X, FileSpreadsheet, BarChart3, CheckCircle2, Award, FileText, Calendar, Mail, MoreVertical, Clock3, ClipboardCheck, AlertTriangle, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { calculateSimalComposite } from "@/lib/simal-grading";
import { calculateCourseGrade } from "@/lib/course-grading";
import { canAccessAdminPortal } from "@/lib/role-capabilities";

interface ExternalStudentItem {
  id: number;
  name: string;
  email: string | null;
  studentIdNumber: string | null;
  cpf: string | null;
  category: string | null;
  university: string | null;
  component: string | null;
  status: string;
  notes: string | null;
  lastSignedIn?: string | null;
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
  assessmentType?: string | null;
  assessmentVersion?: string | null;
  assessmentComponent?: string | null;
  score: string;
  maxScore: string;
  rubricScores?: string | null;
  assessmentDate?: string | null;
  unitNumber?: number | null;
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

interface AssignedTeacher {
  externalClassId: number;
  teacherId: number;
  teacherName: string | null;
  teacherEmail: string | null;
}

interface TeacherOption {
  id: number;
  name: string | null;
  email: string | null;
}

interface ExternalClassItem {
  id: number;
  institution: string;
  className: string;
  courseName: string;
  academicTerm: string;
  description: string | null;
  durationType?: "annual" | "semester" | "workload" | "custom" | null;
  durationValue?: number | null;
  durationUnit?: string | null;
  maxAbsencePercent?: number | null;
  hasUnits?: boolean | null;
  unitCount?: number | null;
  gradingScope?: string | null;
  passingAverage?: string | number | null;
  unitPassingAverages?: string | null;
  instructorName: string | null;
  monitors: string | null;
  students: ExternalStudentItem[];
  attendance?: ExternalClassAttendanceItem[];
  grades?: ExternalClassGradeItem[];
  materials?: ExternalClassMaterialItem[];
  stats?: ExternalClassStats;
  assignedTeachers?: AssignedTeacher[];
}

type ClassFormField = "institution" | "className" | "courseName" | "academicTerm" | "description";
type ClassFormErrors = Partial<Record<ClassFormField, string>>;

type ImportedAttendanceRecord = { date: string; status: "present" | "absent" | "late" | "excused" };

const normalizeImportedHeader = (value: unknown) => String(value ?? "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[_.\/-]+/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const cleanImportedValue = (value: unknown) => String(value ?? "").trim().replace(/^['\"]|['\"]$/g, "").trim();

const toIsoAttendanceDate = (value: unknown, academicTerm: string) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  const raw = cleanImportedValue(value);
  const match = raw.match(/^(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?$/);
  if (!match) return null;
  const yearFromTerm = academicTerm.match(/(19|20)\d{2}/)?.[0];
  const year = match[3] ? (match[3].length === 2 ? `20${match[3]}` : match[3]) : yearFromTerm;
  if (!year) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

const normalizeImportedAttendance = (value: unknown): ImportedAttendanceRecord["status"] | null => {
  const normalized = normalizeImportedHeader(value);
  if (["p", "presente", "present", "presenca", "1", "sim", "ok"].includes(normalized)) return "present";
  if (["f", "falta", "faltou", "absent", "ausente", "a", "0", "nao"].includes(normalized)) return "absent";
  if (["atraso", "atrasado", "late"].includes(normalized)) return "late";
  if (["justificada", "justificado", "excused", "j"].includes(normalized)) return "excused";
  return null;
};

const normalizeWorkloadHours = (value: unknown) => {
  const numeric = Number(cleanImportedValue(value).replace(",", ".").replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
};

const formatDurationLabel = (item: Pick<ExternalClassItem, "durationType" | "durationValue" | "durationUnit">) => {
  if (item.durationType === "annual") return "Anual";
  if (item.durationType === "workload") return item.durationValue ? `${item.durationValue} ${item.durationUnit || "horas"}` : "Por carga horária";
  if (item.durationType === "custom") return item.durationValue ? `${item.durationValue} ${item.durationUnit || "unidade(s)"}` : "Outro formato";
  return item.durationValue && item.durationValue > 1 ? `${item.durationValue} semestres` : "Semestral";
};

const SIMAL_ASSESSMENTS = [
  { value: "simal-units-1-2-4", label: "SIMAL — Units 1, 2 & 4", type: "written", version: "A", maxScore: "8.0" },
  { value: "simal-units-1-2-4-b", label: "SIMAL — Units 1, 2 & 4 (Versão B)", type: "written", version: "B", maxScore: "8.0" },
  { value: "simal-speaking", label: "SIMAL — Speaking (prova oral)", type: "oral", version: "A/B", maxScore: "1.5" },
  { value: "simal-presentation", label: "SIMAL — Presentation", type: "presentation", version: "A/B", maxScore: "2.0" },
] as const;

const SIMAL_COMPONENTS = [
  { value: "grammar", label: "Grammar", maxScore: "2.0" },
  { value: "reading", label: "Reading", maxScore: "2.0" },
  { value: "writing", label: "Writing", maxScore: "1.5" },
  { value: "listening", label: "Listening", maxScore: "1.0" },
  { value: "speaking", label: "Speaking — nota final", maxScore: "1.5" },
  { value: "presentation", label: "Presentation", maxScore: "2.0" },
  { value: "total", label: "Nota total da prova escrita", maxScore: "8.0" },
] as const;

export default function TurmasExternasPage() {
  const { data: session } = useSession();
  const canManage = canAccessAdminPortal({ email: session?.user?.email, role: session?.user?.role });
  const [classes, setClasses] = useState<ExternalClassItem[]>([]);
  const [availableTeachers, setAvailableTeachers] = useState<TeacherOption[]>([]);
  const [assignmentDrafts, setAssignmentDrafts] = useState<Record<number, number[]>>({});
  const [savingAssignmentId, setSavingAssignmentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<{ status?: number; title: string; message: string; action?: string } | null>(null);
  const [operationFeedback, setOperationFeedback] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sendingEmailId, setSendingEmailId] = useState<number | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [isClassFormOpen, setIsClassFormOpen] = useState(false);

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
  const [studentAttendanceFilter, setStudentAttendanceFilter] = useState("all");
  const [reportFilter, setReportFilter] = useState<AcademicReportFilter>("all");
  const [selectedYearFilter, setSelectedYearFilter] = useState("all");
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState("all");
  const [selectedModalityFilter, setSelectedModalityFilter] = useState("all");
  const [selectedLevelFilter, setSelectedLevelFilter] = useState("all");
  const [classSortOrder, setClassSortOrder] = useState("name_asc");

  // Edit class mode
  const [editingClassId, setEditingClassId] = useState<number | null>(null);

  // Edit student mode
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
  const [activeQuickActionsId, setActiveQuickActionsId] = useState<number | null>(null);

  // Form states for creating/editing class
  const [institution, setInstitution] = useState("SIMAL");
  const [customInstitutionInput, setCustomInstitutionInput] = useState("");
  const [isCustomInstitution, setIsCustomInstitution] = useState(false);
  const [className, setClassName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [academicTerm, setAcademicTerm] = useState("2026.1");
  const [description, setDescription] = useState("");
  const [classDays, setClassDays] = useState("Segundas e Quartas");
  const [classTime, setClassTime] = useState("19:00 - 20:30");
  const [workloadHours, setWorkloadHours] = useState(40);
  const [durationType, setDurationType] = useState<"annual" | "semester" | "workload" | "custom">("annual");
  const [durationValue, setDurationValue] = useState(1);
  const [durationUnit, setDurationUnit] = useState("year");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [maxAbsencePercent, setMaxAbsencePercent] = useState(25);
  const [hasUnits, setHasUnits] = useState(false);
  const [unitCount, setUnitCount] = useState(1);
  const [gradingScope, setGradingScope] = useState<"course" | "unit">("course");
  const [passingAverage, setPassingAverage] = useState(5);
  const [unitPassingAverages, setUnitPassingAverages] = useState<Record<number, number>>({});
  const [modality, setModality] = useState("Remota");
  const [meetingLink, setMeetingLink] = useState("");
  const [classroomLocation, setClassroomLocation] = useState("");
  const [level, setLevel] = useState("Básico (A1-A2)");
  const [isDaysModalOpen, setIsDaysModalOpen] = useState(false);
  const [tempSelectedDays, setTempSelectedDays] = useState<string[]>(["Segunda", "Quarta"]);
  const [touchedClassFields, setTouchedClassFields] = useState<Partial<Record<ClassFormField, boolean>>>({});

  const finalInstitutionValue = isCustomInstitution ? customInstitutionInput.trim() : institution.trim();

  useEffect(() => {
    if (editingClassId) return;
    const normalizedInstitution = finalInstitutionValue.toLowerCase();
    if (["simal", "megaworks"].includes(normalizedInstitution)) {
      setDurationType("annual");
      setDurationValue(1);
      setDurationUnit("year");
    } else if (["isf", "profici"].includes(normalizedInstitution)) {
      setDurationType("workload");
      setDurationValue(workloadHours || 1);
      setDurationUnit("hours");
    } else {
      setDurationType("semester");
      setDurationValue(1);
      setDurationUnit("semester");
    }
  }, [finalInstitutionValue, editingClassId]);

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
  const [studentCpf, setStudentCpf] = useState("");
  const [studentCategory, setStudentCategory] = useState("");
  const [studentUniversity, setStudentUniversity] = useState("");
  const [studentComponent, setStudentComponent] = useState("");
  const [studentStatus, setStudentStatus] = useState("active");
  const [studentNotes, setStudentNotes] = useState("");
  const [provisioningAccess, setProvisioningAccess] = useState<number | null>(null);

  // Tab view per class: 'students' | 'attendance' | 'grades' | 'materials'
  const [activeTabByClass, setActiveTabByClass] = useState<Record<number, string>>({});

  const setClassWorkspaceTab = (classId: number, tab: string) => {
    setActiveTabByClass((current) => ({ ...current, [classId]: tab }));
    const url = new URL(window.location.href);
    url.searchParams.set("classId", String(classId));
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", `${url.pathname}?${url.searchParams.toString()}`);
  };

  // Chamada state
  const [attendanceDate, setAttendanceDate] = useState<Record<number, string>>({});
  const [attendanceStatuses, setAttendanceStatuses] = useState<Record<number, Record<number, string>>>({});

  // Grades state
  const [gradeAssessmentTitle, setGradeAssessmentTitle] = useState<Record<number, string>>({});
  const [gradeStudentId, setGradeStudentId] = useState<Record<number, number>>({});
  const [gradeScore, setGradeScore] = useState<Record<number, string>>({});
  const [gradeFeedback, setGradeFeedback] = useState<Record<number, string>>({});
  const [gradeAssessmentPreset, setGradeAssessmentPreset] = useState<Record<number, string>>({});
  const [gradeAssessmentComponent, setGradeAssessmentComponent] = useState<Record<number, string>>({});
  const [gradeAssessmentDate, setGradeAssessmentDate] = useState<Record<number, string>>({});
  const [gradeRubricScores, setGradeRubricScores] = useState<Record<number, { content: string; language: string; comprehensibility: string }>>({});
  const [simalBatchPreset, setSimalBatchPreset] = useState<Record<number, string>>({});
  const [simalBatchComponent, setSimalBatchComponent] = useState<Record<number, string>>({});
  const [simalBatchScores, setSimalBatchScores] = useState<Record<number, Record<number, string>>>({});
  const [simalBatchDate, setSimalBatchDate] = useState<Record<number, string>>({});

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
      setAvailableTeachers(Array.isArray(data.availableTeachers) ? data.availableTeachers : []);
      setLastUpdatedAt(new Date());
      setOperationFeedback(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro inesperado ao carregar turmas externas.";
      setLoadError((current) => current ?? { title: "Não foi possível carregar as turmas", message });
      notifyError(message);
    } finally {
      setLoading(false);
    }
  };

  const [activeTab, setActiveTab] = useState<"classes" | "trash">("classes");
  const [trashClasses, setTrashClasses] = useState<ExternalClassItem[]>([]);
  const [loadingTrash, setLoadingTrash] = useState(false);

  const assignmentIdsForClass = (cls: ExternalClassItem) => assignmentDrafts[cls.id] ?? (cls.assignedTeachers ?? []).map((assignment) => assignment.teacherId);

  const toggleTeacherAssignment = (classId: number, teacherId: number, checked: boolean, fallback: number[]) => {
    setAssignmentDrafts((current) => {
      const selected = current[classId] ?? fallback;
      const next = checked ? Array.from(new Set([...selected, teacherId])) : selected.filter((id) => id !== teacherId);
      return { ...current, [classId]: next };
    });
  };

  const saveTeacherAssignments = async (cls: ExternalClassItem) => {
    try {
      setSavingAssignmentId(cls.id);
      const response = await fetch("/api/professor/external-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setTeacherAssignments", classId: cls.id, teacherIds: assignmentIdsForClass(cls) }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Não foi possível atualizar os professores atribuídos.");
      notifySuccess(data.message || "Professores atribuídos à turma.");
      setAssignmentDrafts((current) => {
        const { [cls.id]: ignored, ...rest } = current;
        return rest;
      });
      await loadClasses();
    } catch (error) {
      notifyError(error instanceof Error ? error.message : "Não foi possível atualizar os professores atribuídos.");
    } finally {
      setSavingAssignmentId(null);
    }
  };

  const loadTrash = async () => {
    try {
      setLoadingTrash(true);
      const res = await fetch("/api/professor/external-classes?mode=trash", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setTrashClasses(Array.isArray(data.classes) ? data.classes : []);
      }
    } catch (err) {
      console.error("Erro ao carregar lixeira de turmas:", err);
    } finally {
      setLoadingTrash(false);
    }
  };

  const handleRestoreClass = async (classId: number) => {
    try {
      const res = await fetch(`/api/professor/external-classes`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restoreClass", classId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao restaurar turma.");
      notifySuccess("Turma externa restaurada com sucesso!");
      void loadClasses();
      void loadTrash();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Erro ao restaurar turma.");
    }
  };

  const handlePermanentDeleteClass = async (classId: number) => {
    if (!confirm("Tem certeza que deseja excluir permanentemente esta turma e seus dados? Esta ação não pode ser desfeita.")) return;
    try {
      const res = await fetch(`/api/professor/external-classes`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "permanentDeleteClass", classId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao excluir permanentemente.");
      notifySuccess("Turma externa excluída permanentemente.");
      void loadTrash();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Erro ao excluir.");
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const classId = Number(params.get("classId"));
    const tab = params.get("tab");
    if (Number.isInteger(classId) && classId > 0 && tab) {
      setActiveTabByClass({ [classId]: tab });
    }
    void loadClasses();
    void loadTrash();
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

  const operationalMetrics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let upcomingLessons = 0;
    let pendingAttendance = 0;
    let lowAttendanceStudents = 0;
    let pendingAssessments = 0;
    let potentialCertificates = 0;

    for (const cls of classes) {
      const startDateValue = (cls as any).startDate ? new Date((cls as any).startDate) : null;
      const endDateValue = (cls as any).endDate ? new Date((cls as any).endDate) : null;
      const isActive = !endDateValue || endDateValue >= today;
      if (isActive && startDateValue && startDateValue >= today) upcomingLessons += 1;
      if (isActive && (cls.attendance?.length || 0) === 0 && cls.students.length > 0) pendingAttendance += 1;

      const attendanceByStudent = new Map<number, { total: number; absent: number }>();
      for (const attendance of cls.attendance || []) {
        try {
          const values = JSON.parse(attendance.attendanceData) as Record<string, string>;
          for (const student of cls.students) {
            const current = attendanceByStudent.get(student.id) || { total: 0, absent: 0 };
            const status = values[String(student.id)];
            if (status) {
              current.total += 1;
              if (status === "absent") current.absent += 1;
            }
            attendanceByStudent.set(student.id, current);
          }
        } catch {
          // Dados legados inválidos não devem interromper o resumo operacional.
        }
      }
      for (const student of cls.students) {
        const attendance = attendanceByStudent.get(student.id);
        if (attendance && attendance.total > 0 && (attendance.absent / attendance.total) * 100 >= (cls.maxAbsencePercent ?? 25) * 0.8) lowAttendanceStudents += 1;
        const hasGrade = (cls.grades || []).some((grade) => grade.studentId === student.id);
        if (isActive && student.status === "active" && !hasGrade) pendingAssessments += 1;
        if (student.status === "active" && hasGrade && (!attendance || attendance.total === 0 || (attendance.absent / attendance.total) * 100 < (cls.maxAbsencePercent ?? 25))) potentialCertificates += 1;
      }
    }

    return { activeClasses: classes.filter((cls) => !(cls as any).endDate || new Date((cls as any).endDate) >= today).length, upcomingLessons, pendingAttendance, lowAttendanceStudents, pendingAssessments, potentialCertificates };
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
      // Calcular faltas por aluno com base nas chamadas registradas
      const maxAbs = cls.maxAbsencePercent ?? 25;
      const filteredStudents = cls.students.filter((s) => {
        const matchesStatus = studentStatusFilter === "all" || s.status === studentStatusFilter;
        const term = searchTerm.toLowerCase();
        const matchesTerm = !term || s.name.toLowerCase().includes(term) || (s.email && s.email.toLowerCase().includes(term)) || (s.studentIdNumber && s.studentIdNumber.toLowerCase().includes(term)) || (s.cpf && s.cpf.toLowerCase().includes(term)) || (s.category && s.category.toLowerCase().includes(term)) || (s.university && s.university.toLowerCase().includes(term)) || (s.component && s.component.toLowerCase().includes(term));
        
        // Calcular frequência e faltas reais
        let totalSessions = 0;
        let absentCount = 0;
        if (cls.attendance) {
          cls.attendance.forEach((att) => {
            try {
              const parsed = JSON.parse(att.attendanceData) as Record<string, string>;
              const status = parsed[String(s.id)];
              if (status) {
                totalSessions++;
                if (status === "absent") absentCount++;
              }
            } catch {}
          });
        }
        const absencePercent = totalSessions > 0 ? (absentCount / totalSessions) * 100 : 0;
        const isAboveLimit = totalSessions > 0 && absencePercent > maxAbs;
        const isNearLimit = totalSessions > 0 && absencePercent >= (maxAbs * 0.8) && absencePercent <= maxAbs;
        const isRegular = totalSessions === 0 || absencePercent < (maxAbs * 0.8);

        let matchesAttendanceFilter = true;
        if (studentAttendanceFilter === "above_limit") {
          matchesAttendanceFilter = isAboveLimit;
        } else if (studentAttendanceFilter === "near_limit") {
          matchesAttendanceFilter = isNearLimit;
        } else if (studentAttendanceFilter === "regular") {
          matchesAttendanceFilter = isRegular;
        }

        return matchesStatus && matchesTerm && matchesAttendanceFilter;
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

      const classModality = (cls as any).modality || "Remota";
      const matchesModality = selectedModalityFilter === "all" || classModality.toLowerCase() === selectedModalityFilter.toLowerCase();

      const classLevel = (cls as any).level || "Básico (A1-A2)";
      const matchesLevel = selectedLevelFilter === "all" || classLevel.toLowerCase().includes(selectedLevelFilter.toLowerCase());

      const term = searchTerm.toLowerCase();
      const matchesClassSearch = !term || cls.className.toLowerCase().includes(term) || cls.courseName.toLowerCase().includes(term) || cls.institution.toLowerCase().includes(term);
      const hasMatchingStudents = cls.filteredStudents.length > 0;
      return matchesInstitution && matchesYear && matchesSemester && matchesModality && matchesLevel && (matchesClassSearch || hasMatchingStudents);
    }).sort((a, b) => {
      if (classSortOrder === "name_asc") {
        return a.className.localeCompare(b.className);
      } else if (classSortOrder === "name_desc") {
        return b.className.localeCompare(a.className);
      } else if (classSortOrder === "students_desc") {
        return (b.students?.length || 0) - (a.students?.length || 0);
      } else if (classSortOrder === "level") {
        const levelA = (a as any).level || "";
        const levelB = (b as any).level || "";
        return levelA.localeCompare(levelB);
      }
      return 0;
    });
  }, [classes, selectedInstitutionFilter, studentStatusFilter, selectedYearFilter, selectedSemesterFilter, selectedModalityFilter, selectedLevelFilter, searchTerm, classSortOrder]);

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
        ? { action, classId: editingClassId, institution: finalInstitution, className, courseName, academicTerm, description, classDays, classTime, workloadHours, durationType, durationValue, durationUnit, startDate, endDate, maxAbsencePercent, hasUnits, unitCount, gradingScope, passingAverage, unitPassingAverages: hasUnits && gradingScope === "unit" ? JSON.stringify(unitPassingAverages) : null, modality, meetingLink, classroomLocation, level }
        : { action, institution: finalInstitution, className, courseName, academicTerm, description, classDays, classTime, workloadHours, durationType, durationValue, durationUnit, startDate, endDate, maxAbsencePercent, hasUnits, unitCount, gradingScope, passingAverage, unitPassingAverages: hasUnits && gradingScope === "unit" ? JSON.stringify(unitPassingAverages) : null, modality, meetingLink, classroomLocation, level };

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
    setIsClassFormOpen(true);
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
    setClassDays((cls as any).classDays || "Segundas e Quartas");
    setClassTime((cls as any).classTime || "19:00 - 20:30");
    setWorkloadHours((cls as any).workloadHours || 40);
    setDurationType((cls.durationType as "annual" | "semester" | "workload" | "custom") || "semester");
    setDurationValue((cls as any).durationValue || 1);
    setDurationUnit((cls as any).durationUnit || "semester");
    setStartDate((cls as any).startDate ? new Date((cls as any).startDate).toISOString().split('T')[0] : "");
    setEndDate((cls as any).endDate ? new Date((cls as any).endDate).toISOString().split('T')[0] : "");
    setMaxAbsencePercent((cls as any).maxAbsencePercent || 25);
    setHasUnits(Boolean((cls as any).hasUnits));
    setUnitCount(Math.max(1, Number((cls as any).unitCount) || 1));
    setGradingScope((cls as any).gradingScope === "unit" ? "unit" : "course");
    setPassingAverage(Number((cls as any).passingAverage) || 5);
    try { setUnitPassingAverages(JSON.parse((cls as any).unitPassingAverages || "{}")); } catch { setUnitPassingAverages({}); }
    setModality((cls as any).modality || "Remota");
    setMeetingLink((cls as any).meetingLink || "");
    setClassroomLocation((cls as any).classroomLocation || "");
    setLevel((cls as any).level || "Básico (A1-A2)");
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
    setClassDays("Segundas e Quartas");
    setClassTime("19:00 - 20:30");
    setWorkloadHours(40);
    setDurationType("annual");
    setDurationValue(1);
    setDurationUnit("year");
    setStartDate("");
    setEndDate("");
    setMaxAbsencePercent(25);
    setHasUnits(false);
    setUnitCount(1);
    setGradingScope("course");
    setPassingAverage(5);
    setUnitPassingAverages({});
    setModality("Remota");
    setMeetingLink("");
    setClassroomLocation("");
    setLevel("Básico (A1-A2)");
    resetClassValidation();
  };

  const handleDuplicateClass = async (classItem: ExternalClassItem) => {
    if (!window.confirm(`Duplicar a turma “${classItem.className}” sem copiar alunos, notas ou chamadas?`)) return;
    try {
      setSubmitting(true);
      const res = await fetch("/api/professor/external-classes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "duplicateClass", classId: classItem.id }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível duplicar a turma.");
      notifySuccess(`Turma duplicada como “${data.classItem?.className || "nova turma"}”. Revise as datas antes de usar.`);
      void loadClasses();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Não foi possível duplicar a turma.");
    } finally {
      setSubmitting(false);
    }
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
        ? { action, studentId: editingStudentId, studentName, studentEmail, studentIdNumber, studentCpf, studentCategory, studentUniversity, studentComponent, studentStatus, studentNotes }
        : { action, classId: selectedClassId, studentName, studentEmail, studentIdNumber, studentCpf, studentCategory, studentUniversity, studentComponent, studentStatus, studentNotes };

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
    setStudentCpf(student.cpf || "");
    setStudentCategory(student.category || "");
    setStudentUniversity(student.university || "");
    setStudentComponent(student.component || "");
    setStudentStatus(student.status);
    setStudentNotes(student.notes || "");
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  const resendExternalStudentPassword = async (classId: number, studentId: number, studentName: string) => {
    setSendingEmailId(studentId);
    try {
      const response = await fetch("/api/admin/external-students/access", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ classId, studentIds: [studentId], action: "resend" }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível reenviar a senha temporária.");
      toast.success(`Nova senha temporária enviada para ${studentName}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível reenviar a senha temporária.");
    } finally {
      setSendingEmailId(null);
    }
  };

  const provisionExternalAccess = async (classId: number) => {
    setProvisioningAccess(classId);
    try {
      const response = await fetch("/api/admin/external-students/access", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ classId, action: "resend" }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível provisionar os acessos.");
      toast.success(`${data.emailed || 0} instrução(ões) de acesso enviada(s) pelo Resend.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível provisionar os acessos.");
    } finally {
      setProvisioningAccess(null);
    }
  };

  const resetStudentForm = () => {
    setEditingStudentId(null);
    setSelectedClassId(null);
    setStudentName("");
    setStudentEmail("");
    setStudentIdNumber("");
    setStudentCpf("");
    setStudentCategory("");
    setStudentUniversity("");
    setStudentComponent("");
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
    const preset = SIMAL_ASSESSMENTS.find((item) => item.value === gradeAssessmentPreset[classId]);
    const title = gradeAssessmentTitle[classId] || preset?.label || "";
    const component = gradeAssessmentComponent[classId] || (preset?.type === "oral" ? "speaking" : preset?.type === "presentation" ? "presentation" : "total");
    const componentPreset = SIMAL_COMPONENTS.find((item) => item.value === component);
    const scoreVal = gradeScore[classId];
    const rubric = gradeRubricScores[classId];
    const rubricValues = rubric ? [rubric.content, rubric.language, rubric.comprehensibility].map(Number) : [];
    const computedRubricScore = rubricValues.length === 3 && rubricValues.every((value) => Number.isFinite(value)) ? rubricValues.reduce((sum, value) => sum + value, 0).toFixed(2) : "";
    const effectiveScore = preset?.type === "oral" && computedRubricScore ? computedRubricScore : scoreVal;
    const maxVal = componentPreset?.maxScore || preset?.maxScore || "10.0";
    const fb = gradeFeedback[classId] || "";

    if (!sId || !title || !effectiveScore) {
      notifyError("Selecione o aluno e informe a avaliação e a nota.");
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
          assessmentType: preset?.type || "custom",
          assessmentVersion: preset?.version || null,
          assessmentComponent: component,
          score: effectiveScore,
          maxScore: maxVal,
          rubricScores: rubric ? JSON.stringify(rubric) : null,
          assessmentDate: gradeAssessmentDate[classId] || new Date().toISOString().slice(0, 10),
          feedback: fb,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar nota.");
      notifySuccess("Nota lançada com sucesso!");
      setGradeAssessmentTitle(prev => ({ ...prev, [classId]: "" }));
      setGradeAssessmentPreset(prev => ({ ...prev, [classId]: "" }));
      setGradeAssessmentComponent(prev => ({ ...prev, [classId]: "" }));
      setGradeAssessmentDate(prev => ({ ...prev, [classId]: "" }));
      setGradeScore(prev => ({ ...prev, [classId]: "" }));
      setGradeFeedback(prev => ({ ...prev, [classId]: "" }));
      setGradeRubricScores(prev => ({ ...prev, [classId]: { content: "", language: "", comprehensibility: "" } }));
      void loadClasses();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Erro ao salvar nota.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveSimalBatch = async (classItem: ExternalClassItem) => {
    const classId = classItem.id;
    const preset = SIMAL_ASSESSMENTS.find((item) => item.value === simalBatchPreset[classId]);
    const component = simalBatchComponent[classId] || (preset?.type === "presentation" ? "presentation" : "total");
    const componentPreset = SIMAL_COMPONENTS.find((item) => item.value === component);
    const scores = simalBatchScores[classId] || {};
    const gradesList = classItem.students.filter((student) => String(scores[student.id] || "").trim()).map((student) => ({ studentId: student.id, score: String(scores[student.id]).trim() }));
    if (!preset || gradesList.length === 0) {
      notifyError("Selecione uma avaliação SIMAL e informe ao menos uma nota.");
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch("/api/professor/external-classes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "saveBatchGrades", classId, assessmentTitle: preset.label, assessmentType: preset.type, assessmentVersion: preset.version, assessmentComponent: component,                                       maxScore: componentPreset?.maxScore || preset.maxScore, assessmentDate: simalBatchDate[classId] || "2026-08-18", unitNumber: (document.getElementById(`simal_unit_${classId}`) as HTMLSelectElement)?.value || null, gradesList }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Não foi possível salvar as notas SIMAL.");
      notifySuccess(`${data.processedCount || gradesList.length} nota(s) SIMAL registrada(s) com sucesso.`);
      setSimalBatchScores((current) => ({ ...current, [classId]: {} }));
      void loadClasses();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Erro ao salvar notas SIMAL.");
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

  const formatReportNumber = (value: number | null) => value === null ? "—" : new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(value);

  const escapeReportHtml = (value: unknown) => String(value ?? "—")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

  const getAcademicReportRows = (cls: ExternalClassItem) => {
    const attendanceByStudent = new Map<number, { present: number; absent: number; late: number; excused: number; total: number }>();
    for (const attendance of cls.attendance || []) {
      try {
        const attendanceData = JSON.parse(attendance.attendanceData) as Record<string, string>;
        for (const student of cls.students) {
          const status = attendanceData[String(student.id)];
          if (!status) continue;
          const current = attendanceByStudent.get(student.id) || { present: 0, absent: 0, late: 0, excused: 0, total: 0 };
          current.total += 1;
          if (status === "present") current.present += 1;
          else if (status === "absent") current.absent += 1;
          else if (status === "late") current.late += 1;
          else current.excused += 1;
          attendanceByStudent.set(student.id, current);
        }
      } catch {
        // Registros inválidos não interrompem a exportação dos demais dados persistidos.
      }
    }

    return cls.students.map((student) => {
      const attendance = attendanceByStudent.get(student.id) || { present: 0, absent: 0, late: 0, excused: 0, total: 0 };
      const studentGrades = (cls.grades || []).filter((grade) => grade.studentId === student.id);
      const simalGrade = calculateSimalComposite(studentGrades);
          const configuredGrade = calculateCourseGrade({ hasUnits: cls.hasUnits, unitCount: cls.unitCount, gradingScope: cls.gradingScope, passingAverage: cls.passingAverage, unitPassingAverages: cls.unitPassingAverages }, studentGrades.map((grade) => ({ score: Number(grade.maxScore) > 0 ? (Number(grade.score) / Number(grade.maxScore)) * 10 : null, unit: grade.unitNumber })));
      const averageGrade = simalGrade.isSimal ? simalGrade.finalScore : configuredGrade.average;
      const attendancePercent = attendance.total > 0 ? (attendance.present / attendance.total) * 100 : null;
      const minimumGrade = Number(cls.passingAverage) || REPORT_MIN_GRADE;
      const failedByGrade = hasFailedByGrade({ averageGrade, attendancePercent }, minimumGrade) || (configuredGrade.scope === "unit" && configuredGrade.passed === false);
      const failedByAttendance = hasFailedByAttendance({ averageGrade, attendancePercent });
      return {
        student,
        attendance,
        attendancePercent,
        grades: studentGrades,
        simalGrade,
        averageGrade,
        failedByGrade,
        failedByAttendance,
      };
    });
  };

  const exportAcademicCsv = (cls: ExternalClassItem, filter: AcademicReportFilter = reportFilter) => {
    const minimumGrade = Number(cls.passingAverage) || REPORT_MIN_GRADE;
    const rows = filterAcademicReportRows(getAcademicReportRows(cls), filter, minimumGrade);
    const csvRows = [
      ["RELATÓRIO ACADÊMICO — NOTAS E PRESENÇAS"],
      ["Instituição", cls.institution],
      ["Turma", cls.className],
      ["Curso / Disciplina", cls.courseName],
      ["Período", cls.academicTerm],
      ["Nível", (cls as any).level || "Não informado"],
      ["Modalidade", (cls as any).modality || "Não informada"],
      ["Gerado em", new Date().toLocaleString("pt-BR")],
      ["Filtro aplicado", academicReportFilterLabel(filter)],
      ["Alunos incluídos", rows.length],
      [],
      ["Aluno", "CPF", "E-mail", "Categoria", "Universidade", "Componente", "Status", "Presenças", "Faltas", "Atrasos", "Justificadas", "Total de chamadas", "Frequência (%)", "Notas", "Prova SIMAL (0–8)", "Apresentação (0–2)", "Nota SIMAL (0–10)", "Média (0–10)"],
      ...rows.map(({ student, attendance, attendancePercent, grades, simalGrade, averageGrade }) => [
        student.name,
        student.cpf || "",
        student.email || "",
        student.category || "",
        student.university || "",
        student.component || "",
        student.status,
        attendance.present,
        attendance.absent,
        attendance.late,
        attendance.excused,
        attendance.total,
        attendancePercent === null ? "" : formatReportNumber(attendancePercent),
        grades.map((grade) => `${grade.assessmentTitle}: ${grade.score}/${grade.maxScore}`).join("; "),
        simalGrade.isSimal ? formatReportNumber(simalGrade.proofScore) : "",
        simalGrade.isSimal ? formatReportNumber(simalGrade.presentationScore) : "",
        simalGrade.isSimal ? formatReportNumber(simalGrade.finalScore) : "",
        averageGrade === null ? "" : formatReportNumber(averageGrade),
      ]),
    ];
    const content = "\uFEFF" + csvRows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio_academico_${cls.id}_${filter}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    notifySuccess(`Relatório CSV exportado com o filtro: ${academicReportFilterLabel(filter)}.`);
  };

  const exportAcademicPdf = (cls: ExternalClassItem, filter: AcademicReportFilter = reportFilter) => {
    const minimumGrade = Number(cls.passingAverage) || REPORT_MIN_GRADE;
    const reportRows = filterAcademicReportRows(getAcademicReportRows(cls), filter, minimumGrade);
    const reportSummary = minimumGrade === REPORT_MIN_GRADE
      ? summarizeAcademicReportRows(reportRows)
      : summarizeAcademicReportRows(reportRows, minimumGrade);
    const generatedAt = new Date().toLocaleString("pt-BR");
    const rowsHtml = reportRows.map(({ student, attendance, attendancePercent, grades, simalGrade, averageGrade }) => `
      <tr>
        <td><strong>${escapeReportHtml(student.name)}</strong><br><small>${escapeReportHtml(student.email || "E-mail não informado")}</small></td>
        <td>${escapeReportHtml(student.cpf || "—")}</td>
        <td>${attendance.present}</td>
        <td>${attendance.absent}</td>
        <td>${attendance.late}</td>
        <td>${attendance.excused}</td>
        <td>${attendance.total}</td>
        <td>${escapeReportHtml(formatReportNumber(attendancePercent))}</td>
        <td>${escapeReportHtml(`${grades.map((grade) => `${grade.assessmentTitle}: ${grade.score}/${grade.maxScore}`).join("; ") || "Sem notas"}${simalGrade.isSimal ? ` • SIMAL: prova ${formatReportNumber(simalGrade.proofScore)}/8 + apresentação ${formatReportNumber(simalGrade.presentationScore)}/2 = ${formatReportNumber(simalGrade.finalScore)}/10` : ""}`)}</td>
        <td>${escapeReportHtml(formatReportNumber(averageGrade))}</td>
      </tr>`).join("");
    const clampPercent = (value: number) => Math.max(0, Math.min(100, value));
    const reportSummaryHtml = `<section class="summary" aria-label="Resumo de aprovação e reprovação">
      <div class="summary-title"><strong>Resumo do desempenho acadêmico</strong><span>${reportSummary.total} aluno(s) no recorte</span></div>
      <div class="chart-row"><span class="chart-label approved-label">Aprovados</span><div class="bar-track"><span class="bar-approved" style="width:${clampPercent(reportSummary.approvedPercent)}%"></span></div><strong>${reportSummary.approved} (${formatReportNumber(reportSummary.approvedPercent)}%)</strong></div>
      <div class="chart-row"><span class="chart-label failed-label">Reprovados</span><div class="bar-track"><span class="bar-failed" style="width:${clampPercent(reportSummary.failedPercent)}%"></span></div><strong>${reportSummary.failed} (${formatReportNumber(reportSummary.failedPercent)}%)</strong></div>
      <div class="chart-row"><span class="chart-label insufficient-label">Dados insuficientes</span><div class="bar-track"><span class="bar-insufficient" style="width:${clampPercent(reportSummary.insufficientDataPercent)}%"></span></div><strong>${reportSummary.insufficientData} (${formatReportNumber(reportSummary.insufficientDataPercent)}%)</strong></div>
      <div class="summary-details"><span>Nota abaixo do limite: <b>${reportSummary.failedByGrade}</b></span><span>Frequência abaixo do limite: <b>${reportSummary.failedByAttendance}</b></span></div>
    </section>`;
    const printWindow = window.open("", "_blank", "width=1200,height=800");
    if (!printWindow) {
      notifyError("Não foi possível abrir a pré-visualização. Permita pop-ups para exportar o PDF.");
      return;
    }
    printWindow.opener = null;
    printWindow.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8" /><title>Relatório acadêmico — ${escapeReportHtml(cls.className)}</title><style>
      @page { size: A4 landscape; margin: 14mm; } body { font-family: Arial, sans-serif; color: #1f2937; font-size: 10px; } header { border-bottom: 3px solid #d62828; padding-bottom: 12px; margin-bottom: 16px; } h1 { margin: 0 0 5px; color: #b91c1c; font-size: 20px; } h2 { margin: 0 0 12px; font-size: 14px; } .meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 12px 0 16px; } .meta div { background: #f3f4f6; border-radius: 6px; padding: 7px; } .meta b { display: block; color: #6b7280; font-size: 8px; text-transform: uppercase; margin-bottom: 3px; } .summary { border: 1px solid #d1d5db; border-radius: 8px; padding: 10px 12px; margin: 12px 0 16px; page-break-inside: avoid; } .summary-title { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 8px; color: #374151; } .summary-title span { color: #6b7280; font-size: 9px; } .chart-row { display: grid; grid-template-columns: 105px 1fr 105px; align-items: center; gap: 8px; margin: 6px 0; } .chart-label { font-size: 9px; font-weight: 700; } .approved-label { color: #166534; } .failed-label { color: #991b1b; } .insufficient-label { color: #4b5563; } .bar-track { height: 10px; overflow: hidden; border-radius: 999px; background: #e5e7eb; } .bar-track span { display: block; height: 100%; min-width: 0; border-radius: 999px; } .bar-approved { background: #16a34a; } .bar-failed { background: #dc2626; } .bar-insufficient { background: #9ca3af; } .chart-row strong { text-align: right; font-size: 9px; color: #374151; } .summary-details { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 8px; padding-top: 7px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 8px; } table { width: 100%; border-collapse: collapse; } th { background: #374151; color: white; text-align: left; padding: 7px 5px; font-size: 8px; } td { border-bottom: 1px solid #e5e7eb; padding: 6px 5px; vertical-align: top; } tr:nth-child(even) td { background: #f9fafb; } small { color: #6b7280; } footer { margin-top: 14px; color: #6b7280; font-size: 8px; } </style></head><body>
      <header><h1>Relatório Acadêmico</h1><h2>${escapeReportHtml(cls.courseName)} — ${escapeReportHtml(cls.className)}</h2><div>Documento gerado em ${escapeReportHtml(generatedAt)}</div></header>
      ${reportSummaryHtml}
      <div class="meta"><div><b>Instituição</b>${escapeReportHtml(cls.institution)}</div><div><b>Período</b>${escapeReportHtml(cls.academicTerm)}</div><div><b>Nível</b>${escapeReportHtml((cls as any).level || "Não informado")}</div><div><b>Modalidade</b>${escapeReportHtml((cls as any).modality || "Não informada")}</div><div><b>Filtro aplicado</b>${escapeReportHtml(academicReportFilterLabel(filter))}</div><div><b>Alunos incluídos</b>${reportRows.length}</div></div>
      <table><thead><tr><th>Aluno / e-mail</th><th>CPF</th><th>Pres.</th><th>Faltas</th><th>Atrasos</th><th>Just.</th><th>Total</th><th>Freq. %</th><th>Notas</th><th>Média</th></tr></thead><tbody>${rowsHtml || '<tr><td colspan="10">Nenhum aluno cadastrado nesta turma.</td></tr>'}</tbody></table>
      <footer>Relatório acadêmico interno. Os dados apresentados correspondem aos registros persistidos da turma no momento da exportação. Critérios de reprovação: média inferior a ${minimumGrade.toFixed(1)} ou frequência inferior a ${REPORT_MIN_ATTENDANCE}% quando aplicáveis.</footer>
      </body></html>`);
    printWindow.document.close();
    printWindow.focus();
    window.setTimeout(() => printWindow.print(), 250);
    notifySuccess(`Pré-visualização PDF aberta com o filtro: ${academicReportFilterLabel(filter)}.`);
  };

  const downloadStudentTemplate = () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([
      ["Nome completo", "CPF", "E-mail", "Matrícula", "Categoria", "Universidade", "Componente", "Dias", "Horário", "CH", "Professor", "Status"],
      ["Exemplo: Ana Silva", "", "ana@example.com", "", "Estudante", "UFBA", "Básico", "Quarta", "18:00 às 22:00", "16H", "", "active"],
    ]);
    worksheet["!cols"] = [18, 15, 28, 16, 22, 18, 16, 14, 18, 10, 24, 12].map((wch) => ({ wch }));
    XLSX.utils.book_append_sheet(workbook, worksheet, "Alunos");
    XLSX.writeFile(workbook, "modelo-importacao-alunos-turma-externa.xlsx");
    notifySuccess("Modelo de planilha baixado.");
  };

  // Importação real de CSV/TSV/XLS/XLSX para os layouts IsF e PROFICI.
  const handleCsvImport = async (classId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSubmitting(true);
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) throw new Error("A planilha não contém uma aba para importação.");
      const sheet = workbook.Sheets[firstSheetName];
      const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "", raw: true });
      if (matrix.length < 2) throw new Error("O arquivo precisa de um cabeçalho e ao menos uma linha de dados.");

      const rawHeaders = (matrix[0] || []).map((header) => cleanImportedValue(header));
      const headers = rawHeaders.map(normalizeImportedHeader);
      const selectedClass = classes.find((item) => item.id === classId);
      const academicTerm = selectedClass?.academicTerm || "";
      const csvData: Array<Record<string, unknown> & { attendanceRecords: ImportedAttendanceRecord[] }> = [];
      const classMetadata: Record<string, string | number> = {};
      let attendanceColumnsDetected = 0;
      let skippedRows = 0;

      const firstValue = (row: Record<string, unknown>, ...keys: string[]) => {
        for (const key of keys) {
          const value = cleanImportedValue(row[key]);
          if (value) return value;
        }
        return "";
      };

      for (let i = 1; i < matrix.length; i++) {
        const values = matrix[i] || [];
        const row: Record<string, unknown> = {};
        const attendanceRecords: ImportedAttendanceRecord[] = [];
        headers.forEach((header, index) => {
          if (!header) return;
          const value = values[index] ?? "";
          row[header] = value;
          const attendanceDate = toIsoAttendanceDate(rawHeaders[index], academicTerm);
          if (attendanceDate) {
            attendanceColumnsDetected += 1;
            const status = normalizeImportedAttendance(value);
            if (status) attendanceRecords.push({ date: attendanceDate, status });
          }
        });

        const name = firstValue(row, "nome", "nome completo", "nome do aluno", "student name");
        if (!name) {
          skippedRows += 1;
          continue;
        }

        const email = firstValue(row, "email", "e mail", "correio eletronico");
        const cpf = firstValue(row, "cpf");
        const studentIdNumber = firstValue(row, "studentidnumber", "matricula", "numero de matricula", "id");
        const category = firstValue(row, "category", "categoria");
        const university = firstValue(row, "university", "universidade", "instituicao");
        const component = firstValue(row, "component", "componente", "nivel");
        const days = firstValue(row, "dias", "turma");
        const time = firstValue(row, "horario", "hora");
        const workload = normalizeWorkloadHours(firstValue(row, "ch", "carga horaria", "carga horaria total"));
        const instructor = firstValue(row, "professor", "teacher");
        const monitors = firstValue(row, "monitores", "monitor");

        if (days && !classMetadata.classDays) classMetadata.classDays = days;
        if (time && !classMetadata.classTime) classMetadata.classTime = time;
        if (component && !classMetadata.level) classMetadata.level = component;
        if (workload && !classMetadata.workloadHours) classMetadata.workloadHours = workload;
        if (instructor && !classMetadata.instructorName) classMetadata.instructorName = instructor;
        if (monitors && !classMetadata.monitors) classMetadata.monitors = monitors;

        csvData.push({ name, email, cpf, studentIdNumber, category, university, component, attendanceRecords });
      }

      if (csvData.length === 0) {
        throw new Error("Nenhum aluno válido encontrado. A coluna Nome completo é obrigatória.");
      }

      const confirmed = window.confirm([
        `Prévia da importação: ${csvData.length} registro(s) válido(s).`,
        skippedRows > 0 ? `${skippedRows} linha(s) sem nome serão ignoradas.` : "Nenhuma linha sem nome foi encontrada.",
        attendanceColumnsDetected > 0 ? `${attendanceColumnsDetected} coluna(s) de presença serão processadas.` : "Nenhuma coluna de presença foi detectada.",
        "A API verificará duplicidades e informará quantos registros foram criados ou atualizados. Deseja confirmar?",
      ].join("\\n"));
      if (!confirmed) {
        notifySuccess("Importação cancelada antes de alterar os dados da turma.");
        return;
      }

      const res = await fetch("/api/professor/external-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "importCsvStudents", classId, csvData, classMetadata }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao importar alunos.");

      const format = /\.xlsx?$/i.test(file.name) ? "Excel" : "CSV/TSV";
      const attendanceMessage = attendanceColumnsDetected > 0 ? ` ${attendanceColumnsDetected} coluna(s) de presença identificada(s).` : "";
      const skippedMessage = skippedRows > 0 ? ` ${skippedRows} linha(s) sem nome foram ignoradas.` : "";
      notifySuccess(`${format}: ${data.importedCount} aluno(s) importado(s) e ${data.updatedCount || 0} atualizado(s).${attendanceMessage}${skippedMessage}`);
      void loadClasses();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Erro ao processar arquivo de alunos.");
    } finally {
      setSubmitting(false);
      e.target.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32 text-gray-900 dark:bg-slate-950 dark:text-white p-4 sm:p-6 lg:p-10 font-sans">
      <div className="max-w-[1500px] mx-auto space-y-6 sm:space-y-8">
        {/* Cabeçalho */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-5 rounded-[28px] border border-gray-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 px-5 py-5 md:px-7 md:py-6 shadow-[0_12px_36px_rgba(15,23,42,0.06)] dark:shadow-none backdrop-blur">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Link
                href="/professor"
                className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition shadow-xs"
                title="Voltar ao Painel"
              >
                <ArrowLeft size={18} />
              </Link>
              <h1 className="text-xl leading-tight sm:text-3xl font-black tracking-tight text-gray-950 dark:text-white flex items-center gap-2">
                <Building2 className="text-red-600" size={26} /> Turmas externas
              </h1>
            </div>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-slate-300 pl-13 max-w-3xl">
              Organize alunos, aulas, frequência, avaliações e materiais em um só lugar.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:justify-end" aria-label="Resumo de sincronização">
            <button
              type="button"
              onClick={() => { setIsClassFormOpen(true); window.scrollTo({ top: 420, behavior: "smooth" }); }}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3.5 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
              <Plus size={15} aria-hidden="true" /> Nova turma
            </button>
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-extrabold ${loadError ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300" : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"}`}>
              <span className={`h-2 w-2 rounded-full ${loadError ? "bg-red-500" : "bg-emerald-500"}`} aria-hidden="true" /> {loadError ? "Falha na atualização" : lastUpdatedAt ? `Atualizado às ${lastUpdatedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` : "Atualizando dados"}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-[11px] font-extrabold text-gray-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Building2 size={13} aria-hidden="true" /> {classes.length} {classes.length === 1 ? "turma cadastrada" : "turmas cadastradas"}
            </span>
          </div>
        </header>

        <section aria-labelledby="operational-overview-title" className="rounded-[28px] border border-gray-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900 p-4 sm:p-5 lg:p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:shadow-none">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-red-600">Visão operacional</p>
              <h2 id="operational-overview-title" className="text-lg sm:text-xl font-black text-gray-950 dark:text-white">O que precisa da sua atenção</h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400">Os indicadores são calculados a partir dos registros atuais das turmas.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
            {[
              { label: "Turmas ativas", value: operationalMetrics.activeClasses, icon: Building2, tone: "text-red-600 bg-red-50 dark:bg-red-950/30" },
              { label: "Próximas aulas", value: operationalMetrics.upcomingLessons, icon: Calendar, tone: "text-blue-600 bg-blue-50 dark:bg-blue-950/30" },
              { label: "Chamadas pendentes", value: operationalMetrics.pendingAttendance, icon: ClipboardCheck, tone: "text-amber-600 bg-amber-50 dark:bg-amber-950/30" },
              { label: "Baixa frequência", value: operationalMetrics.lowAttendanceStudents, icon: AlertTriangle, tone: "text-orange-600 bg-orange-50 dark:bg-orange-950/30" },
              { label: "Avaliações pendentes", value: operationalMetrics.pendingAssessments, icon: BarChart3, tone: "text-violet-600 bg-violet-50 dark:bg-violet-950/30" },
              { label: "Potenciais certificados", value: operationalMetrics.potentialCertificates, icon: Award, tone: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" },
            ].map(({ label, value, icon: Icon, tone }) => (
              <div key={label} className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-800/40 p-3.5">
                <div className={`mb-3 inline-flex rounded-xl p-2 ${tone}`}><Icon size={16} aria-hidden="true" /></div>
                <p className={`text-2xl font-black ${loadError ? "text-gray-400 dark:text-slate-500" : "text-gray-950 dark:text-white"}`}>{loadError ? "—" : value}</p>
                <p className="mt-1 text-[11px] font-bold leading-tight text-gray-500 dark:text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {loadError && (
          <section
            role="alert"
            aria-live="assertive"
            className="rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-3 dark:border-red-900/60 dark:bg-red-950/30"
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
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {Object.entries(institutionSummary).map(([inst, summary]) => (
              <div key={inst} className="group rounded-[24px] border border-gray-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900 p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)] dark:shadow-none space-y-3 transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(15,23,42,0.09)]">
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
        <section className="rounded-[28px] border border-gray-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900 p-4 sm:p-5 lg:p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:shadow-none flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Buscar por turma, curso ou aluno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-100/70 dark:bg-slate-800/80 text-sm font-semibold text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition"
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
              <span className="text-xs font-bold text-gray-500 whitespace-nowrap">Modalidade:</span>
              <select
                value={selectedModalityFilter}
                onChange={(e) => setSelectedModalityFilter(e.target.value)}
                className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none"
              >
                <option value="all">Todas</option>
                <option value="Remota">Remota</option>
                <option value="Presencial">Presencial</option>
                <option value="Híbrida">Híbrida</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 whitespace-nowrap">Nível:</span>
              <select
                value={selectedLevelFilter}
                onChange={(e) => setSelectedLevelFilter(e.target.value)}
                className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none"
              >
                <option value="all">Todos</option>
                <option value="Básico">Básico</option>
                <option value="Intermediário">Intermediário</option>
                <option value="Avançado">Avançado</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 whitespace-nowrap">Ordenar:</span>
              <select
                value={classSortOrder}
                onChange={(e) => setClassSortOrder(e.target.value)}
                className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none"
              >
                <option value="name_asc">Nome (A - Z)</option>
                <option value="name_desc">Nome (Z - A)</option>
                <option value="students_desc">Qtd. Alunos (Maior)</option>
                <option value="level">Nível Acadêmico</option>
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
              <span className="text-xs font-bold text-gray-500 whitespace-nowrap">Frequência:</span>
              <select
                value={studentAttendanceFilter}
                onChange={(e) => setStudentAttendanceFilter(e.target.value)}
                className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none"
              >
                <option value="all">Todas as Frequências</option>
                <option value="above_limit">Acima do Limite de Faltas 🚨</option>
                <option value="near_limit">Próximos do Limite (80%-100%) ⚠️</option>
                <option value="regular">Frequência Regular ✅</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 whitespace-nowrap">Relatório:</span>
              <select
                value={reportFilter}
                onChange={(e) => setReportFilter(e.target.value as AcademicReportFilter)}
                aria-label="Filtrar exportação por reprovação"
                className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="all">Todos os alunos</option>
                <option value="grade">Reprovados por nota (&lt; 6,0)</option>
                <option value="attendance">Reprovados por falta (&lt; 75%)</option>
                <option value="any">Qualquer reprovação</option>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Formulários de Cadastro / Edição */}
          <div className="space-y-6 lg:col-span-1">
            {/* Criar / Editar Turma */}
            <section className="rounded-[28px] border border-gray-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900 p-5 sm:p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:shadow-none space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-black text-gray-950 dark:text-white flex items-center gap-2">
                  <BookOpen size={18} className="text-red-600" /> {editingClassId ? "Editar Turma Externa" : "Nova Turma Externa"}
                </h2>
                <button type="button" onClick={() => setIsClassFormOpen((current) => !current)} className="rounded-xl border border-gray-200 dark:border-slate-700 px-3 py-2 text-[11px] font-black text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800" aria-expanded={isClassFormOpen}>
                  {isClassFormOpen ? "Recolher" : "Abrir formulário"}
                </button>
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
              {isClassFormOpen && <form onSubmit={handleSaveClass} className="space-y-4">
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
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Nível da Turma</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 p-3 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    <option value="Básico (A1-A2)">Básico (A1-A2)</option>
                    <option value="Intermediário (B1-B2)">Intermediário (B1-B2)</option>
                    <option value="Avançado (C1-C2)">Avançado (C1-C2)</option>
                    <option value="Fluência e Conversação">Fluência e Conversação</option>
                    <option value="Específico / Instrumental">Específico / Instrumental</option>
                  </select>
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
                {/* Calendário, Modalidade e Frequência */}
                <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-slate-800">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Modalidade da Turma</label>
                    <select
                      value={modality}
                      onChange={(e) => setModality(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 p-3 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                    >
                      <option value="Remota">Remota (Online)</option>
                      <option value="Presencial">Presencial</option>
                      <option value="Híbrida">Híbrida</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-gray-200 dark:border-slate-800">
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${modality === "Remota" ? "bg-blue-500" : "bg-emerald-500"}`}></span>
                        Modalidade: {modality}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Dias: <span className="font-semibold text-gray-700 dark:text-gray-300">{classDays}</span></p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsDaysModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5"
                    >
                      <Calendar size={14} /> Configurar Aulas
                    </button>
                  </div>

                  {modality === "Presencial" ? (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Local / Sala Presencial</label>
                      <input
                        type="text"
                        value={classroomLocation}
                        onChange={(e) => setClassroomLocation(e.target.value)}
                        placeholder="Ex: Sala 302, Pavilhão de Aulas UFBA"
                        className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 p-2.5 text-xs font-semibold text-gray-900 dark:text-white"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Link da Sala Online (Zoom, Meet, Teams)</label>
                      <input
                        type="url"
                        value={meetingLink}
                        onChange={(e) => setMeetingLink(e.target.value)}
                        placeholder="https://meet.google.com/abc-defg-hij"
                        className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 p-2.5 text-xs font-semibold text-gray-900 dark:text-white"
                      />
                    </div>
                  )}

                  <div className="rounded-2xl border border-red-100 dark:border-red-900/40 bg-red-50/60 dark:bg-red-950/20 p-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <label htmlFor="external-duration-type" className="block text-xs font-bold text-gray-800 dark:text-gray-200">Formato de duração</label>
                        <p className="mt-1 text-[11px] text-gray-600 dark:text-gray-400">SIMAL e Megaworks costumam ser anuais; IsF/PROFICI podem ser controlados por carga horária.</p>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-red-700 dark:text-red-300">Regra acadêmica</span>
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <select id="external-duration-type" value={durationType} onChange={(e) => {
                        const next = e.target.value as "annual" | "semester" | "workload" | "custom";
                        setDurationType(next);
                        setDurationUnit(next === "annual" ? "year" : next === "semester" ? "semester" : next === "workload" ? "hours" : "custom");
                      }} className="w-full rounded-xl border border-red-200 bg-white p-2.5 text-xs font-semibold text-gray-900 dark:border-red-900/60 dark:bg-slate-800 dark:text-white">
                        <option value="annual">Anual</option>
                        <option value="semester">Semestral</option>
                        <option value="workload">Por carga horária</option>
                        <option value="custom">Outro formato</option>
                      </select>
                      <input aria-label="Valor da duração" type="number" min={1} max={9999} value={durationValue} onChange={(e) => setDurationValue(Number(e.target.value) || 1)} className="w-full rounded-xl border border-red-200 bg-white p-2.5 text-xs font-semibold text-gray-900 dark:border-red-900/60 dark:bg-slate-800 dark:text-white" />
                      <input aria-label="Unidade da duração" type="text" value={durationUnit} onChange={(e) => setDurationUnit(e.target.value)} placeholder="year, semester, hours..." className="w-full rounded-xl border border-red-200 bg-white p-2.5 text-xs font-semibold text-gray-900 dark:border-red-900/60 dark:bg-slate-800 dark:text-white" />
                    </div>
                    <p className="mt-2 text-[11px] font-semibold text-red-800 dark:text-red-200">{durationType === "annual" ? "Duração: 1 ano letivo." : durationType === "semester" ? "Duração: semestre letivo." : durationType === "workload" ? `Duração definida por ${durationValue} hora(s).` : "Use o campo de unidade para descrever o formato."}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Horário</label>
                      <input
                        type="text"
                        value={classTime}
                        onChange={(e) => setClassTime(e.target.value)}
                        placeholder="Ex: 19:00 - 20:30"
                        className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 p-2.5 text-xs font-semibold text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Carga Horária (h)</label>
                      <input
                        type="number"
                        min={1}
                        max={500}
                        value={workloadHours}
                        onChange={(e) => setWorkloadHours(parseInt(e.target.value) || 40)}
                        className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 p-2.5 text-xs font-semibold text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Máx. Faltas (%)</label>
                      <input
                        type="number"
                        min={5}
                        max={50}
                        value={maxAbsencePercent}
                        onChange={(e) => setMaxAbsencePercent(parseInt(e.target.value) || 25)}
                        className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 p-2.5 text-xs font-semibold text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="sm:col-span-2 rounded-xl border border-red-200 bg-red-50/60 p-3 dark:border-red-900/50 dark:bg-red-950/20">
                      <label className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-gray-200">
                        <input type="checkbox" checked={hasUnits} onChange={(e) => { setHasUnits(e.target.checked); if (!e.target.checked) setGradingScope("course"); }} />
                        Dividir o curso em unidades
                      </label>
                      {hasUnits && <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">Quantidade de unidades
                          <input type="number" min={1} max={100} value={unitCount} onChange={(e) => setUnitCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))} className="mt-1 w-full rounded-lg border border-red-200 bg-white p-2 text-xs dark:border-red-900/60 dark:bg-slate-800 dark:text-white" />
                        </label>
                        <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">Critério de aprovação
                          <select value={gradingScope} onChange={(e) => setGradingScope(e.target.value as "course" | "unit")} className="mt-1 w-full rounded-lg border border-red-200 bg-white p-2 text-xs dark:border-red-900/60 dark:bg-slate-800 dark:text-white">
                            <option value="course">Média do curso todo</option>
                            <option value="unit">Média mínima em cada unidade</option>
                          </select>
                        </label>
                        <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">Média mínima geral
                          <select value={passingAverage} onChange={(e) => setPassingAverage(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-red-200 bg-white p-2 text-xs dark:border-red-900/60 dark:bg-slate-800 dark:text-white">
                            <option value={5}>5,0</option><option value={6}>6,0</option><option value={7}>7,0</option>
                          </select>
                        </label>
                        {gradingScope === "unit" && <div className="sm:col-span-3 grid grid-cols-2 gap-2 md:grid-cols-4">{Array.from({ length: unitCount }, (_, index) => index + 1).map((unit) => <label key={unit} className="text-[11px] font-bold text-gray-700 dark:text-gray-300">Unidade {unit}
                          <select value={unitPassingAverages[unit] ?? passingAverage} onChange={(e) => setUnitPassingAverages((current) => ({ ...current, [unit]: Number(e.target.value) }))} className="mt-1 w-full rounded-lg border border-red-200 bg-white p-2 text-xs dark:border-red-900/60 dark:bg-slate-800 dark:text-white"><option value={5}>5,0</option><option value={6}>6,0</option><option value={7}>7,0</option></select>
                        </label>)}</div>}
                      </div>}
                      <p className="mt-2 text-[10px] text-red-800 dark:text-red-200">A regra fica registrada na turma e poderá ser usada nos relatórios acadêmicos. Notas já lançadas não são alteradas.</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Início</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 p-2.5 text-xs font-semibold text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Término</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 p-2.5 text-xs font-semibold text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
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
              </form>}
            </section>

            {/* Matricular ou Editar Aluno */}
            <section className="rounded-[28px] border border-gray-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900 p-5 sm:p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:shadow-none space-y-4">
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
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">CPF</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="000.000.000-00"
                      value={studentCpf}
                      onChange={(e) => setStudentCpf(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 p-3 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
                    <input
                      type="text"
                      placeholder="Ex.: Estudante de pós-graduação"
                      value={studentCategory}
                      onChange={(e) => setStudentCategory(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 p-3 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Universidade</label>
                    <input
                      type="text"
                      placeholder="Ex.: UFBA"
                      value={studentUniversity}
                      onChange={(e) => setStudentUniversity(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 p-3 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Componente / Nível</label>
                    <input
                      type="text"
                      placeholder="Ex.: Básico ou Intermediário"
                      value={studentComponent}
                      onChange={(e) => setStudentComponent(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 p-3 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                  </div>
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
              <div role="status" aria-live="polite" className="space-y-4" aria-label="Carregando turmas externas">
                <div className="flex items-center gap-2 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-xs font-bold text-blue-700 dark:text-blue-200"><Loader2 size={15} className="animate-spin" aria-hidden="true" /> Carregando turmas, alunos e indicadores…</div>
                <div className="space-y-6 animate-pulse">
                  {[1, 2].map((i) => (
                    <div key={i} className="rounded-[28px] border border-gray-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:shadow-none space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4">
                      <div className="space-y-2 w-3/4">
                        <div className="flex gap-2">
                          <div className="h-5 w-24 bg-gray-200 dark:bg-slate-800 rounded-full" />
                          <div className="h-5 w-20 bg-gray-200 dark:bg-slate-800 rounded-full" />
                          <div className="h-5 w-28 bg-gray-200 dark:bg-slate-800 rounded-full" />
                        </div>
                        <div className="h-6 w-1/2 bg-gray-200 dark:bg-slate-800 rounded-xl" />
                        <div className="h-4 w-1/3 bg-gray-200 dark:bg-slate-800 rounded-lg" />
                      </div>
                      <div className="flex gap-2">
                        <div className="h-9 w-20 bg-gray-200 dark:bg-slate-800 rounded-xl" />
                        <div className="h-9 w-20 bg-gray-200 dark:bg-slate-800 rounded-xl" />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3 bg-gray-50 dark:bg-slate-800/40 p-3 rounded-2xl">
                      {[1, 2, 3, 4].map((box) => (
                        <div key={box} className="h-10 bg-gray-200 dark:bg-slate-800 rounded-xl" />
                      ))}
                    </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : loadError ? (
              <div role="alert" aria-live="assertive" className="rounded-[28px] border border-red-200 bg-red-50/70 p-6 text-center shadow-[0_10px_30px_rgba(220,38,38,0.06)] space-y-3 dark:border-red-900/60 dark:bg-red-950/20 sm:p-10">
                <AlertCircle size={28} className="mx-auto text-red-500" aria-hidden="true" />
                <h3 className="text-sm font-bold text-red-900 dark:text-red-200">Não conseguimos carregar suas turmas</h3>
                <p className="mx-auto max-w-sm text-xs leading-relaxed text-red-700 dark:text-red-300">{loadError.status && loadError.status >= 500 ? "O servidor está temporariamente indisponível. Seus dados não foram alterados; tente novamente em alguns instantes." : loadError.message}</p>
                {loadError.status && <p className="text-[11px] font-semibold text-red-700/80 dark:text-red-300/80">Código de resposta: {loadError.status}</p>}
                <button
                  type="button"
                  onClick={() => void loadClasses()}
                  disabled={loading}
                  className="mt-2 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
                >
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} aria-hidden="true" /> {loading ? "Tentando…" : "Tentar novamente"}
                </button>
              </div>
            ) : filteredClasses.length === 0 ? (
              <div
                role="status"
                aria-live="polite"
                className="rounded-[28px] border border-gray-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-12 text-center shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:shadow-none space-y-3"
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
                  <div key={cls.id} className="group rounded-[28px] border border-gray-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900 p-5 sm:p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] dark:shadow-none space-y-6 transition duration-200 hover:border-red-200 dark:hover:border-red-900/60 hover:shadow-[0_16px_40px_rgba(15,23,42,0.10)]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-5">
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
                          <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                            {(cls as any).level || "Básico (A1-A2)"}
                          </span>
                          <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                            {(cls as any).modality || "Remota"}
                          </span>
                          <span className="text-xs font-bold text-gray-500">Período: {cls.academicTerm}</span>
                          <span className="text-xs font-bold text-red-700 dark:text-red-300">Duração: {formatDurationLabel(cls)}</span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black tracking-tight text-gray-950 dark:text-white">{cls.className}</h3>
                        <p className="text-xs font-semibold text-red-600 dark:text-red-400">{cls.courseName}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-1">
                          {(cls as any).classDays && <span>🗓 Dias: <strong className="text-gray-700 dark:text-gray-300">{(cls as any).classDays}</strong></span>}
                          {(cls as any).classTime && <span>⏰ Horário: <strong className="text-gray-700 dark:text-gray-300">{(cls as any).classTime}</strong></span>}
                          {(cls as any).workloadHours && <span>⏱ Carga Horária: <strong className="text-gray-700 dark:text-gray-300">{(cls as any).workloadHours}h</strong></span>}
                        </div>
                        {cls.description && <p className="text-xs text-gray-500 pt-1">{cls.description}</p>}
                        {canManage && (
                          <details className="mt-3 rounded-2xl border border-violet-200 bg-violet-50/70 p-3 text-xs text-violet-950 dark:border-violet-900/50 dark:bg-violet-950/20 dark:text-violet-100">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-black">
                              <span className="inline-flex items-center gap-1.5"><Users size={14} aria-hidden="true" /> Professores atribuídos</span>
                              <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-extrabold text-violet-700 dark:bg-slate-900/70 dark:text-violet-200">{(cls.assignedTeachers ?? []).length} ativo(s)</span>
                            </summary>
                            <p className="mt-2 leading-relaxed text-violet-800 dark:text-violet-200">O professor criador mantém a responsabilidade principal. Selecione professores adicionais para dar acesso operacional a esta turma.</p>
                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                              {availableTeachers.map((teacher) => {
                                const selected = assignmentIdsForClass(cls).includes(teacher.id);
                                return (
                                  <label key={teacher.id} className="flex cursor-pointer items-start gap-2 rounded-xl border border-violet-200/80 bg-white/80 p-2.5 dark:border-violet-900/50 dark:bg-slate-900/70">
                                    <input
                                      type="checkbox"
                                      checked={selected}
                                      onChange={(event) => toggleTeacherAssignment(cls.id, teacher.id, event.target.checked, (cls.assignedTeachers ?? []).map((assignment) => assignment.teacherId))}
                                      className="mt-0.5 h-4 w-4 accent-violet-600"
                                    />
                                    <span className="min-w-0"><span className="block truncate font-bold">{teacher.name || "Professor sem nome"}</span><span className="block truncate text-[10px] text-violet-700/80 dark:text-violet-300/80">{teacher.email || "E-mail não informado"}</span></span>
                                  </label>
                                );
                              })}
                            </div>
                            {availableTeachers.length === 0 && <p className="mt-3 rounded-xl bg-white/70 p-2.5 font-semibold text-violet-800 dark:bg-slate-900/70 dark:text-violet-200">Não há professores ativos disponíveis para atribuição.</p>}
                            <button
                              type="button"
                              onClick={() => void saveTeacherAssignments(cls)}
                              disabled={savingAssignmentId === cls.id}
                              className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl bg-violet-700 px-3 py-2 font-black text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {savingAssignmentId === cls.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                              Salvar atribuições
                            </button>
                          </details>
                        )}
                      </div>
                      <div className="relative flex items-center gap-2">
                        <div className="hidden sm:flex items-center gap-2 flex-wrap">
                          <label className="cursor-pointer px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                            <FileSpreadsheet size={14} className="text-green-600" /> Importar planilha
                            <input
                              type="file"
                              accept=".csv,.tsv,.xls,.xlsx"
                              className="hidden"
                              onChange={(e) => void handleCsvImport(cls.id, e)}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => exportAcademicCsv(cls)}
                            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-bold hover:border-emerald-300 hover:bg-emerald-50 dark:hover:border-emerald-900/60 dark:hover:bg-emerald-950/30 transition flex items-center gap-1.5 text-gray-700 dark:text-gray-300"
                            title="Exportar relatório acadêmico em CSV"
                          >
                            <FileSpreadsheet size={14} className="text-emerald-600" /> Relatório CSV
                          </button>
                          <button
                            type="button"
                            onClick={() => exportAcademicPdf(cls)}
                            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-bold hover:border-red-300 hover:bg-red-50 dark:hover:border-red-900/60 dark:hover:bg-red-950/30 transition flex items-center gap-1.5 text-gray-700 dark:text-gray-300"
                            title="Abrir relatório acadêmico para salvar em PDF"
                          >
                            <FileText size={14} className="text-red-600" /> Relatório PDF
                          </button>
                          <button
                            type="button"
                            onClick={() => startEditClass(cls)}
                            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition flex items-center gap-1.5 text-gray-700 dark:text-gray-300"
                          >
                            <Edit3 size={14} /> Editar
                          </button>
                        </div>

                        {/* Menu de Ações Rápidas */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setActiveQuickActionsId(activeQuickActionsId === cls.id ? null : cls.id)}
                            className="p-2.5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:border-red-200 hover:bg-red-50 hover:text-red-700 dark:hover:border-red-900/60 dark:hover:bg-red-950/30 dark:hover:text-red-300 transition flex items-center gap-1 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                            title="Ações Rápidas da Turma"
                            aria-label="Ações Rápidas"
                          >
                            <MoreVertical size={16} /> <span className="hidden sm:inline">Ações</span>
                          </button>

                          {activeQuickActionsId === cls.id && (
                            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl z-50 space-y-1">
                              <label className="w-full cursor-pointer px-3 py-2 rounded-xl text-xs font-bold hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center gap-2 text-gray-700 dark:text-gray-200">
                                <FileSpreadsheet size={14} className="text-green-600" /> Importar Excel/CSV
                                <input
                                  type="file"
                                  accept=".csv,.tsv,.xls,.xlsx"
                                  className="hidden"
                                  onChange={(e) => {
                                    setActiveQuickActionsId(null);
                                    void handleCsvImport(cls.id, e);
                                  }}
                                />
                              </label>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveQuickActionsId(null);
                                  downloadStudentTemplate();
                                }}
                                className="w-full px-3 py-2 rounded-xl text-xs font-bold hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center gap-2 text-gray-700 dark:text-gray-200 text-left"
                              >
                                <FileSpreadsheet size={14} className="text-indigo-600" /> Baixar modelo de planilha
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveQuickActionsId(null);
                                  void handleDuplicateClass(cls);
                                }}
                                className="w-full px-3 py-2 rounded-xl text-xs font-bold hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center gap-2 text-gray-700 dark:text-gray-200 text-left"
                              >
                                <Sparkles size={14} className="text-purple-600" /> Duplicar estrutura
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveQuickActionsId(null);
                                  startEditClass(cls);
                                }}
                                className="w-full px-3 py-2 rounded-xl text-xs font-bold hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center gap-2 text-gray-700 dark:text-gray-200 text-left"
                              >
                                <Edit3 size={14} className="text-blue-600" /> Editar Turma
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveQuickActionsId(null);
                                  setClassWorkspaceTab(cls.id, "students");
                                }}
                                className="w-full px-3 py-2 rounded-xl text-xs font-bold hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center gap-2 text-gray-700 dark:text-gray-200 text-left"
                              >
                                <Users size={14} className="text-amber-600" /> Gerenciar Alunos ({cls.students.length})
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveQuickActionsId(null);
                                  exportAcademicCsv(cls);
                                }}
                                className="w-full px-3 py-2 rounded-xl text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex items-center gap-2 text-gray-700 dark:text-gray-200 text-left"
                              >
                                <FileSpreadsheet size={14} className="text-emerald-600" /> Relatório acadêmico CSV
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveQuickActionsId(null);
                                  exportAcademicPdf(cls);
                                }}
                                className="w-full px-3 py-2 rounded-xl text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 text-gray-700 dark:text-gray-200 text-left"
                              >
                                <FileText size={14} className="text-red-600" /> Relatório acadêmico PDF
                              </button>

                              <div className="border-t border-gray-100 dark:border-slate-800 my-1" />

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveQuickActionsId(null);
                                  handleDeleteClass(cls.id);
                                }}
                                className="w-full px-3 py-2 rounded-xl text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 text-red-600 text-left"
                              >
                                <Trash2 size={14} /> Excluir Turma
                              </button>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteClass(cls.id)}
                          className="hidden"
                          aria-hidden="true"
                        >
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
                        onClick={() => setClassWorkspaceTab(cls.id, "students")}
                        className={`pb-2.5 px-3 text-xs font-bold whitespace-nowrap border-b-2 transition flex items-center gap-1.5 ${
                          activeTab === "students"
                            ? "border-red-600 text-red-600 dark:text-red-400"
                            : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        <Users size={14} /> Alunos ({cls.students.length})
                      </button>
                      {canManage && <button type="button" onClick={() => provisionExternalAccess(cls.id)} disabled={provisioningAccess === cls.id || cls.students.length === 0} className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-black text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-wait disabled:opacity-50 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">{provisioningAccess === cls.id ? "Enviando..." : "Reenviar senha temporária"}</button>}
                      <button
                        type="button"
                        onClick={() => setClassWorkspaceTab(cls.id, "attendance")}
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
                        onClick={() => setClassWorkspaceTab(cls.id, "grades")}
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
                        onClick={() => setClassWorkspaceTab(cls.id, "materials")}
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
                            {cls.filteredStudents.map((st) => {
                              // Calcular estatísticas individuais para tags de atenção
                              const maxAbs = cls.maxAbsencePercent ?? 25;
                              let totalSessions = 0;
                              let absentCount = 0;
                              if (cls.attendance) {
                                cls.attendance.forEach((att) => {
                                  try {
                                    const parsed = JSON.parse(att.attendanceData) as Record<string, string>;
                                    const status = parsed[String(st.id)];
                                    if (status) {
                                      totalSessions++;
                                      if (status === "absent") absentCount++;
                                    }
                                  } catch {}
                                });
                              }
                              const absencePercent = totalSessions > 0 ? (absentCount / totalSessions) * 100 : 0;
                              const isHighAbsence = totalSessions > 0 && absencePercent > maxAbs;

                              const studentGrades = (cls.grades || []).filter(g => g.studentId === st.id);
                              const avgGrade = studentGrades.length > 0 ? studentGrades.reduce((a, b) => a + (Number(b.score) || 0), 0) / studentGrades.length : null;
                              const isLowGrade = avgGrade !== null && avgGrade < 6.0;

                              return (
                                <div key={st.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-sm text-gray-900 dark:text-white">{st.name}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                                      st.status === "active" ? "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300" :
                                      st.status === "completed" ? "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300" :
                                      "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400"
                                    }`}>
                                      {st.status === "active" ? "Ativo" : st.status === "completed" ? "Concluído" : "Inativo"}
                                    </span>
                                    {isHighAbsence && (
                                      <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300 flex items-center gap-1" title="Faltas acima do limite permitido!">
                                        🚨 Faltas ({absencePercent.toFixed(0)}%)
                                      </span>
                                    )}
                                    {isLowGrade && (
                                      <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 flex items-center gap-1" title="Média de notas abaixo de 6.0">
                                        ⚠️ Nota Baixa ({avgGrade.toFixed(1)})
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {st.email || "Sem e-mail"} {st.studentIdNumber ? `• Matrícula: ${st.studentIdNumber}` : ""} {st.cpf ? `• CPF: ${st.cpf}` : ""}
                                  </p>
                                  <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">Último acesso: <span className="font-semibold text-gray-700 dark:text-gray-200">{st.lastSignedIn ? new Date(st.lastSignedIn).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "Ainda não acessou"}</span></p>
                                  {(st.category || st.university || st.component) && (
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                      {st.category && <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-semibold">{st.category}</span>}
                                      {st.university && <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold">{st.university}</span>}
                                      {st.component && <span className="text-[10px] px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold">Comp: {st.component}</span>}
                                    </div>
                                  )}
                                  {st.notes && <p className="text-xs text-gray-400 italic mt-1">Obs: {st.notes}</p>}
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {canManage && st.email && (
                                    <button
                                      type="button"
                                      disabled={sendingEmailId === st.id}
                                      onClick={() => void resendExternalStudentPassword(cls.id, st.id, st.name)}
                                      className="px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-xs font-bold hover:bg-red-100 transition text-red-700 dark:text-red-300 flex items-center gap-1"
                                      title="Reenviar senha temporária para o aluno"
                                    >
                                      {sendingEmailId === st.id ? <Loader2 size={12} className="animate-spin" /> : <Mail size={12} />}
                                      Reenviar Boas-vindas
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const printWin = window.open("", "_blank");
                                      if (!printWin) {
                                        notifyError("Permita popups no navegador para gerar o boletim PDF.");
                                        return;
                                      }
                                      const gradesList = (cls.grades || []).filter(g => g.studentId === st.id);
                                      const gradesHtml = gradesList.length > 0 ? gradesList.map(g => `<tr><td>${g.assessmentTitle}</td><td>${g.score} / ${g.maxScore}</td><td>${g.feedback || "-"}</td></tr>`).join("") : '<tr><td colspan="3">Nenhuma nota lançada.</td></tr>';

                                      printWin.document.write(`
                                        <html>
                                          <head>
                                            <title>Boletim Individual - ${st.name}</title>
                                            <style>
                                              body { font-family: Arial, sans-serif; margin: 40px; color: #111; }
                                              h1 { color: #dc2626; font-size: 20px; margin-bottom: 4px; }
                                              h2 { font-size: 14px; margin-top: 25px; border-bottom: 2px solid #dc2626; padding-bottom: 4px; }
                                              table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
                                              th { background: #f3f4f6; padding: 8px; text-align: left; border-bottom: 2px solid #ccc; }
                                              td { padding: 8px; border-bottom: 1px solid #ddd; }
                                              .meta { background: #f9fafb; padding: 14px; border-radius: 8px; margin-bottom: 20px; font-size: 12px; line-height: 1.5; }
                                            </style>
                                          </head>
                                          <body>
                                            <h1>Boletim Acadêmico Individual</h1>
                                            <p>Plataforma Anderson Palafoz — Ensino de Inglês e Capacitação</p>
                                            <div class="meta">
                                              <strong>Aluno(a):</strong> ${st.name} <br/>
                                              <strong>E-mail:</strong> ${st.email || "Não informado"} | <strong>Matrícula:</strong> ${st.studentIdNumber || "N/A"}<br/>
                                              <strong>Turma:</strong> ${cls.className} (${cls.institution})<br/>
                                              <strong>Disciplina/Curso:</strong> ${cls.courseName} | <strong>Período:</strong> ${cls.academicTerm}<br/>
                                              <strong>Frequência Registrada:</strong> Faltas: ${absentCount} de ${totalSessions} aulas (${absencePercent.toFixed(1)}%)<br/>
                                              <strong>Média Geral de Notas:</strong> ${avgGrade !== null ? avgGrade.toFixed(1) + " / 10.0" : "Sem notas lançadas"}
                                            </div>
                                            <h2>Notas e Avaliações Detalhadas</h2>
                                            <table>
                                              <thead><tr><th>Avaliação</th><th>Nota</th><th>Feedback do Professor</th></tr></thead>
                                              <tbody>${gradesHtml}</tbody>
                                            </table>
                                            <script>window.onload = function() { window.print(); }</script>
                                          </body>
                                        </html>
                                      `);
                                      printWin.document.close();
                                      printWin.focus();
                                      notifySuccess(`Gerando boletim PDF para ${st.name}...`);
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-xs font-bold hover:bg-red-100 transition text-red-700 dark:text-red-300 flex items-center gap-1"
                                    title="Gerar e exportar boletim individual em PDF"
                                  >
                                    <FileText size={12} /> Boletim PDF
                                  </button>
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
                            )})}
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
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">Lançar avaliação SIMAL</h4>
                              <p className="mt-1 text-[11px] text-gray-500">Funciona para alunos já cadastrados e para novos alunos adicionados na aba Alunos.</p>
                            </div>
                            <span className="rounded-full bg-red-100 px-2 py-1 text-[10px] font-black text-red-700 dark:bg-red-950/40 dark:text-red-300">Versão A aplicada</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 mb-1">Aluno</label>
                              <select value={gradeStudentId[cls.id] || ""} onChange={(e) => setGradeStudentId({ ...gradeStudentId, [cls.id]: Number(e.target.value) })} className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-gray-900 dark:text-white">
                                <option value="">-- Aluno --</option>
                                {cls.students.map((st) => <option key={st.id} value={st.id}>{st.name}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 mb-1">Avaliação</label>
                              <select value={gradeAssessmentPreset[cls.id] || ""} onChange={(e) => { const value = e.target.value; const preset = SIMAL_ASSESSMENTS.find((item) => item.value === value); setGradeAssessmentPreset({ ...gradeAssessmentPreset, [cls.id]: value }); setGradeAssessmentTitle({ ...gradeAssessmentTitle, [cls.id]: preset?.label || "" }); setGradeAssessmentComponent({ ...gradeAssessmentComponent, [cls.id]: preset?.type === "oral" ? "speaking" : preset?.type === "presentation" ? "presentation" : "total" }); }} className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-gray-900 dark:text-white">
                                <option value="">Avaliação livre</option>
                                {SIMAL_ASSESSMENTS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 mb-1">Componente</label>
                              <select value={gradeAssessmentComponent[cls.id] || "total"} onChange={(e) => setGradeAssessmentComponent({ ...gradeAssessmentComponent, [cls.id]: e.target.value })} className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-gray-900 dark:text-white">
                                {SIMAL_COMPONENTS.map((item) => <option key={item.value} value={item.value}>{item.label} — máx. {item.maxScore}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 mb-1">Data da avaliação</label>
                              <input type="date" value={gradeAssessmentDate[cls.id] || "2026-08-18"} onChange={(e) => setGradeAssessmentDate({ ...gradeAssessmentDate, [cls.id]: e.target.value })} className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-gray-900 dark:text-white" />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 mb-1">Título personalizado (opcional)</label>
                              <input type="text" placeholder="Usado apenas para avaliação livre" value={gradeAssessmentTitle[cls.id] || ""} onChange={(e) => setGradeAssessmentTitle({ ...gradeAssessmentTitle, [cls.id]: e.target.value })} className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-gray-900 dark:text-white" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 mb-1">Nota obtida</label>
                              <input type="text" placeholder="Ex.: 1.7" value={gradeScore[cls.id] || ""} onChange={(e) => setGradeScore({ ...gradeScore, [cls.id]: e.target.value })} className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-gray-900 dark:text-white" />
                            </div>
                          </div>
                          {gradeAssessmentPreset[cls.id] === "simal-speaking" && (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/20">
                              <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">Rubrica Speaking — cada critério vale até 0,5</p>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {([ ["content", "Content and topic fulfillment"], ["language", "Use of language"], ["comprehensibility", "Comprehensibility"] ] as const).map(([key, label]) => <label key={key} className="text-[10px] font-bold text-amber-900 dark:text-amber-200">{label}<input type="number" min="0" max="0.5" step="0.1" value={gradeRubricScores[cls.id]?.[key] || ""} onChange={(e) => setGradeRubricScores({ ...gradeRubricScores, [cls.id]: { content: gradeRubricScores[cls.id]?.content || "", language: gradeRubricScores[cls.id]?.language || "", comprehensibility: gradeRubricScores[cls.id]?.comprehensibility || "", [key]: e.target.value } })} className="mt-1 w-full rounded-lg border border-amber-200 bg-white p-2 text-xs text-gray-900 dark:border-amber-800 dark:bg-slate-900 dark:text-white" /></label>)}
                              </div>
                              <p className="mt-2 text-[11px] text-amber-800 dark:text-amber-300">A soma será calculada automaticamente e registrada como nota final de Speaking.</p>
                            </div>
                          )}
                          <input type="text" placeholder="Feedback / comentário (opcional)" value={gradeFeedback[cls.id] || ""} onChange={(e) => setGradeFeedback({ ...gradeFeedback, [cls.id]: e.target.value })} className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-gray-900 dark:text-white" />
                          <button type="button" onClick={() => void handleSaveGrade(cls.id)} disabled={submitting || cls.students.length === 0} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50">Salvar nota da avaliação</button>
                        </div>

                        <div className="space-y-3 rounded-2xl border border-red-100 bg-red-50/50 p-4 dark:border-red-950/50 dark:bg-red-950/10">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h5 className="text-xs font-black uppercase tracking-wider text-red-800 dark:text-red-300">Lançamento SIMAL por aluno</h5>
                              <p className="mt-1 text-[11px] text-red-700/80 dark:text-red-300/80">Preencha somente os alunos avaliados. As linhas vazias não serão gravadas.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <select value={simalBatchPreset[cls.id] || ""} onChange={(e) => { const value = e.target.value; const preset = SIMAL_ASSESSMENTS.find((item) => item.value === value); setSimalBatchPreset({ ...simalBatchPreset, [cls.id]: value }); setSimalBatchComponent({ ...simalBatchComponent, [cls.id]: preset?.type === "presentation" ? "presentation" : "total" }); }} className="rounded-lg border border-red-200 bg-white p-2 text-[11px] font-semibold text-gray-900 dark:border-red-900 dark:bg-slate-900 dark:text-white"><option value="">Escolher avaliação</option>{SIMAL_ASSESSMENTS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
                              <select value={simalBatchComponent[cls.id] || "total"} onChange={(e) => setSimalBatchComponent({ ...simalBatchComponent, [cls.id]: e.target.value })} className="rounded-lg border border-red-200 bg-white p-2 text-[11px] font-semibold text-gray-900 dark:border-red-900 dark:bg-slate-900 dark:text-white">{SIMAL_COMPONENTS.map((item) => <option key={item.value} value={item.value}>{item.label} / {item.maxScore}</option>)}</select>
                              <input type="date" value={simalBatchDate[cls.id] || "2026-08-18"} onChange={(e) => setSimalBatchDate({ ...simalBatchDate, [cls.id]: e.target.value })} className="rounded-lg border border-red-200 bg-white p-2 text-[11px] text-gray-900 dark:border-red-900 dark:bg-slate-900 dark:text-white" />
                              {cls.hasUnits && <select id={`simal_unit_${cls.id}`} defaultValue="1" className="rounded-lg border border-red-200 bg-white p-2 text-[11px] font-semibold text-gray-900 dark:border-red-900 dark:bg-slate-900 dark:text-white"><option value="">Sem unidade</option>{Array.from({ length: Math.max(1, cls.unitCount || 1) }, (_, index) => <option key={index + 1} value={index + 1}>Unidade {index + 1}</option>)}</select>}
                            </div>
                          </div>
                          <div className="max-h-72 overflow-y-auto rounded-xl border border-red-100 bg-white dark:border-red-950/50 dark:bg-slate-900">
                            {cls.students.map((student) => <div key={student.id} className="grid grid-cols-[minmax(0,1fr)_96px] items-center gap-3 border-b border-gray-100 px-3 py-2 last:border-0 dark:border-slate-800"><div className="min-w-0"><p className="truncate text-xs font-bold text-gray-900 dark:text-white">{student.name}</p><p className="truncate text-[10px] text-gray-500">{student.email || student.studentIdNumber || "Sem e-mail/matrícula"}</p></div><input type="text" inputMode="decimal" placeholder="Nota" aria-label={`Nota de ${student.name}`} value={simalBatchScores[cls.id]?.[student.id] || ""} onChange={(e) => setSimalBatchScores({ ...simalBatchScores, [cls.id]: { ...(simalBatchScores[cls.id] || {}), [student.id]: e.target.value } })} className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2 text-center text-xs font-bold text-gray-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white" /></div>)}
                            {cls.students.length === 0 && <p className="p-4 text-center text-xs text-gray-500">Cadastre alunos na aba Alunos antes de lançar as notas.</p>}
                          </div>
                          <button type="button" onClick={() => void handleSaveSimalBatch(cls)} disabled={submitting || cls.students.length === 0} className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50">Salvar notas preenchidas</button>
                        </div>

                        {/* Edição em Lote de Notas */}
                        <div className="pt-4 border-t border-gray-100 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800">
                          <h5 className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">Edição Rápida / Lançamento em Lote para Todos os Alunos</h5>
                          <p className="text-[11px] text-gray-500">Insira uma atividade padrão (ex: Participação / Trabalho Final) e atribua a nota para todos os alunos de uma só vez.</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 mb-1">Título da Atividade em Lote</label>
                              <input
                                type="text"
                                placeholder="Ex: Projeto de Leitura 1"
                                id={`batch_title_${cls.id}`}
                                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-gray-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-500 mb-1">Nota Padrão para Todos (ex: 10.0)</label>
                              <input
                                type="text"
                                placeholder="10.0"
                                id={`batch_score_${cls.id}`}
                                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              const titleInput = document.getElementById(`batch_title_${cls.id}`) as HTMLInputElement;
                              const scoreInput = document.getElementById(`batch_score_${cls.id}`) as HTMLInputElement;
                              const unitInput = document.getElementById(`simal_unit_${cls.id}`) as HTMLSelectElement;
                              const title = titleInput?.value?.trim();
                              const score = scoreInput?.value?.trim();
                              if (!title || !score) {
                                notifyError("Informe o título e a nota para o lançamento em lote.");
                                return;
                              }
                              if (cls.students.length === 0) {
                                notifyError("Não há alunos nesta turma.");
                                return;
                              }
                              try {
                                setSubmitting(true);
                                for (const st of cls.students) {
                                  await fetch("/api/professor/external-classes", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      action: "saveGrade",
                                      classId: cls.id,
                                      studentId: st.id,
                                      assessmentTitle: title,
                                      score,
                                      maxScore: "10.0",
                                      unitNumber: unitInput?.value || null,
                                      feedback: "Lançamento em lote automatizado",
                                    }),
                                  });
                                }
                                notifySuccess(`Nota lançada em lote para ${cls.students.length} aluno(s) com sucesso!`);
                                titleInput.value = "";
                                scoreInput.value = "";
                                void loadClasses();
                              } catch (err) {
                                notifyError("Erro ao processar lançamento em lote.");
                              } finally {
                                setSubmitting(false);
                              }
                            }}
                            disabled={submitting || cls.students.length === 0}
                            className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
                          >
                            Aplicar Nota em Lote para Todos os Alunos
                          </button>
                        </div>

                        {/* Listagem de Notas Lançadas */}
                        <div className="space-y-3 pt-2">
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
                                        {st ? st.name : "Aluno ID " + g.studentId} —                                         <span className="text-red-600">{g.assessmentTitle}</span>
                                      </p>
                                      <p className="mt-0.5 flex flex-wrap items-center gap-1 text-[10px] text-gray-500">
                                        {g.assessmentVersion && <span className="rounded-full bg-red-50 px-1.5 py-0.5 font-bold text-red-700 dark:bg-red-950/40 dark:text-red-300">Versão {g.assessmentVersion}</span>}
                                        {g.assessmentComponent && <span className="rounded-full bg-gray-100 px-1.5 py-0.5 font-bold text-gray-600 dark:bg-slate-800 dark:text-gray-300">{g.assessmentComponent}</span>}
                                        {g.assessmentDate && <span>{g.assessmentDate}</span>}
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

      {/* Modal para configurar dias da semana e horário */}
      {isDaysModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="presentation">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 text-gray-950 shadow-2xl dark:border-slate-700 dark:bg-slate-900 dark:text-white space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Calendar className="text-red-600" size={20} />
                <h3 className="text-base font-black">Configurar Dias de Aula</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDaysModalOpen(false)}
                className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-gray-500">Selecione os dias da semana em que ocorrem os encontros desta turma:</p>
              <div className="grid grid-cols-2 gap-2">
                {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"].map((day) => {
                  const isChecked = tempSelectedDays.includes(day);
                  return (
                    <label
                      key={day}
                      className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition ${isChecked ? "border-red-600 bg-red-50/50 dark:bg-red-950/20 text-red-700 dark:text-red-300 font-bold" : "border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300"}`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTempSelectedDays((prev) => [...prev, day]);
                          } else {
                            setTempSelectedDays((prev) => prev.filter((d) => d !== day));
                          }
                        }}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-600 w-4 h-4"
                      />
                      <span className="text-xs">{day}</span>
                    </label>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Resumo Textual dos Dias</label>
                <input
                  type="text"
                  value={classDays}
                  onChange={(e) => setClassDays(e.target.value)}
                  placeholder="Ex: Segundas e Quartas, 19h"
                  className="w-full rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 p-3 text-xs font-semibold text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (tempSelectedDays.length > 0) {
                    setClassDays(tempSelectedDays.join(" e "));
                  }
                  setIsDaysModalOpen(false);
                }}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition"
              >
                Aplicar e Salvar Dias
              </button>
            </div>
          </div>
        </div>
      )}

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
