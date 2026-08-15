"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronLeft, GraduationCap, Loader2, Search, UserPlus, UserRound, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/useAuth";

interface StudentOption {
  id: number;
  name: string | null;
  email: string | null;
  approvalStatus: "pending" | "approved" | "rejected";
}

interface CourseOption {
  id: number;
  title: string;
  level: string;
}

interface Enrollment {
  id: number;
  userId: number;
  courseId: number;
  progress: number;
  status: "active" | "completed" | "paused" | "cancelled";
  enrolledAt: string;
  completedAt: string | null;
  student: StudentOption;
  course: CourseOption;
}

interface EnrollmentData {
  students: StudentOption[];
  courses: CourseOption[];
  enrollments: Enrollment[];
}

const statusLabels: Record<Enrollment["status"], string> = {
  active: "Ativa",
  completed: "Concluída",
  paused: "Pausada",
  cancelled: "Desvinculada",
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

export default function AdminEnrollmentsPage() {
  const { user, isLoading: authLoading } = useAuth(true);
  const router = useRouter();
  const [data, setData] = useState<EnrollmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [busyEnrollmentId, setBusyEnrollmentId] = useState<number | null>(null);
  const [studentId, setStudentId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Enrollment["status"]>("active");

  useEffect(() => {
    if (!authLoading && user && user.role !== "admin") {
      router.replace("/");
    }
  }, [authLoading, router, user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/enrollments", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Não foi possível carregar as matrículas.");
      setData(payload);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível carregar as matrículas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.role === "admin") void loadData();
  }, [authLoading, user]);

  const filteredEnrollments = useMemo(() => {
    if (!data) return [];
    const normalizedSearch = search.trim().toLowerCase();
    return data.enrollments.filter((enrollment) => {
      const matchesStatus = statusFilter === "all" || enrollment.status === statusFilter;
      const searchable = `${enrollment.student.name || ""} ${enrollment.student.email || ""} ${enrollment.course.title}`.toLowerCase();
      return matchesStatus && (!normalizedSearch || searchable.includes(normalizedSearch));
    });
  }, [data, search, statusFilter]);

  const handleEnroll = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!studentId || !courseId) {
      toast.error("Selecione um aluno e um curso para continuar.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("/api/admin/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: Number(studentId), courseId: Number(courseId) }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Não foi possível criar a matrícula.");
      toast.success(payload.message || "Aluno matriculado com sucesso.");
      setStudentId("");
      setCourseId("");
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível criar a matrícula.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnenroll = async (enrollment: Enrollment) => {
    const studentName = enrollment.student.name || enrollment.student.email || "este aluno";
    if (!window.confirm(`Desvincular ${studentName} do curso "${enrollment.course.title}"? O histórico será preservado.`)) return;

    try {
      setBusyEnrollmentId(enrollment.id);
      const response = await fetch("/api/admin/enrollments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId: enrollment.id }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Não foi possível desvincular a matrícula.");
      toast.success(payload.message || "Aluno desvinculado do curso.");
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível desvincular a matrícula.");
    } finally {
      setBusyEnrollmentId(null);
    }
  };

  if (authLoading || loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="animate-spin text-red-600" size={32} /></div>;
  }

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <div>
            <Link href="/admin" className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-red-600">
              <ChevronLeft size={16} /> Voltar ao painel
            </Link>
            <h1 className="text-2xl font-black text-gray-900">Matrículas</h1>
            <p className="mt-1 text-sm text-gray-500">Vincule alunos aos cursos e preserve o histórico em caso de desistência.</p>
          </div>
          <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 sm:flex"><GraduationCap size={26} /></div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600"><UserPlus size={20} /></div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Matricular aluno em um curso</h2>
              <p className="mt-1 text-sm text-gray-500">A nova matrícula começa com progresso de 0%. Matrículas desvinculadas podem ser reativadas.</p>
            </div>
          </div>
          <form onSubmit={handleEnroll} className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <label className="block text-sm font-semibold text-gray-700">
              Aluno
              <select value={studentId} onChange={(event) => setStudentId(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-normal text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100">
                <option value="">Selecione um aluno</option>
                {data?.students.map((student) => <option key={student.id} value={student.id}>{student.name || student.email || `Usuário #${student.id}`} — {student.approvalStatus === "approved" ? "Aprovado" : "Acesso pendente"}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold text-gray-700">
              Curso
              <select value={courseId} onChange={(event) => setCourseId(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-normal text-gray-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100">
                <option value="">Selecione um curso</option>
                {data?.courses.map((course) => <option key={course.id} value={course.id}>{course.title} — {course.level}</option>)}
              </select>
            </label>
            <Button type="submit" disabled={submitting} className="h-11 rounded-xl bg-red-600 px-5 font-bold text-white hover:bg-red-700">
              {submitting ? <Loader2 size={17} className="animate-spin" /> : <UserPlus size={17} />}
              {submitting ? "Salvando..." : "Matricular"}
            </Button>
          </form>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Matrículas registradas</h2>
              <p className="mt-1 text-sm text-gray-500">Desvincule uma matrícula apenas quando houver desistência ou erro de cadastro.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative block">
                <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar aluno ou curso" className="h-10 w-full rounded-xl border border-gray-300 pl-9 pr-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 sm:w-64" />
              </label>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | Enrollment["status"])} className="h-10 rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-red-500">
                <option value="active">Ativas</option>
                <option value="all">Todas</option>
                <option value="completed">Concluídas</option>
                <option value="paused">Pausadas</option>
                <option value="cancelled">Desvinculadas</option>
              </select>
            </div>
          </div>

          {filteredEnrollments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-12 text-center">
              <UserRound className="mx-auto text-gray-400" size={28} />
              <p className="mt-3 text-sm font-semibold text-gray-700">Nenhuma matrícula encontrada</p>
              <p className="mt-1 text-xs text-gray-500">Ajuste os filtros ou crie uma nova matrícula acima.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEnrollments.map((enrollment) => {
                const isCancelled = enrollment.status === "cancelled";
                return (
                  <div key={enrollment.id} className={`flex flex-col gap-4 rounded-xl border p-4 transition sm:flex-row sm:items-center sm:justify-between ${isCancelled ? "border-gray-200 bg-gray-50 opacity-75" : "border-gray-200 bg-white hover:border-red-200"}`}>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-gray-900">{enrollment.student.name || "Aluno sem nome"}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isCancelled ? "bg-gray-200 text-gray-600" : enrollment.status === "completed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{statusLabels[enrollment.status]}</span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">{enrollment.student.email || "Email não informado"}</p>
                      <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-gray-700"><GraduationCap size={15} className="text-red-600" /> {enrollment.course.title} <span className="font-normal text-gray-400">· {enrollment.course.level}</span></p>
                    </div>
                    <div className="flex items-center gap-4 sm:justify-end">
                      <div className="min-w-28 text-left sm:text-right">
                        <p className="text-xs text-gray-500">Progresso</p>
                        <p className="font-bold text-gray-900">{isCancelled ? "—" : `${enrollment.progress}%`}</p>
                        <p className="text-[11px] text-gray-400">Desde {formatDate(enrollment.enrolledAt)}</p>
                      </div>
                      {!isCancelled ? (
                        <Button type="button" variant="outline" onClick={() => void handleUnenroll(enrollment)} disabled={busyEnrollmentId === enrollment.id} className="h-10 rounded-xl border-red-200 px-3 text-red-600 hover:bg-red-50 hover:text-red-700">
                          {busyEnrollmentId === enrollment.id ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                          <span className="hidden sm:inline">Desvincular</span>
                        </Button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500"><CheckCircle2 size={15} /> Histórico preservado</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
