"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Calendar,
  Check,
  ChevronLeft,
  Clock3,
  Filter,
  GraduationCap,
  Loader2,
  Plus,
  Search,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/useAuth";

interface Student {
  id: number;
  name: string | null;
  email: string | null;
}

interface Course {
  id: number;
  title: string;
  level: string;
}

interface ClassSession {
  id: number;
  courseId: number | null;
  title: string;
  description: string | null;
  modality: "individual" | "group" | "hybrid";
  scheduledAt: string;
  durationMinutes: number;
  status: "scheduled" | "completed" | "cancelled";
}

interface Attendance {
  id: number;
  sessionId: number;
  studentId: number;
  present: boolean;
  status: "present" | "absent" | "justified";
  notes: string | null;
}

type StatusFilter = "all" | "scheduled" | "completed" | "cancelled";
type DateFilter = "all" | "upcoming" | "past";

const modalityLabels = {
  individual: "Individual",
  group: "Em grupo",
  hybrid: "Híbrida",
};

const statusLabels = {
  scheduled: "Agendada",
  completed: "Concluída",
  cancelled: "Cancelada",
};

function statusBadge(status: ClassSession["status"]) {
  if (status === "completed") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "cancelled") return "bg-gray-100 text-gray-600 border-gray-200";
  return "bg-blue-50 text-blue-700 border-blue-200";
}

export default function AdminChamadaPage() {
  const { user, isLoading: authLoading } = useAuth(true);
  const router = useRouter();
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [modalityFilter, setModalityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [description, setDescription] = useState("");
  const [modality, setModality] = useState<"individual" | "group" | "hybrid">("group");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [attendanceMap, setAttendanceMap] = useState<Record<number, "present" | "absent" | "justified">>({});

  useEffect(() => {
    if (!authLoading && user && user.role !== "admin" && user.role !== "professor") {
      router.replace("/");
    }
  }, [authLoading, router, user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/sessions", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao carregar dados de chamada.");
      setSessions(data.sessions);
      setCourses(data.courses);
      setStudents(data.students);
      setAttendances(data.attendances);
      const initialMap: Record<number, "present" | "absent" | "justified"> = {};
      data.students.forEach((student: Student) => {
        initialMap[student.id] = "present";
      });
      setAttendanceMap(initialMap);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao carregar chamada.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) void loadData();
  }, [authLoading, user]);

  const metrics = useMemo(() => {
    const total = attendances.length;
    const present = attendances.filter((attendance) => attendance.status === "present").length;
    const absent = attendances.filter((attendance) => attendance.status === "absent").length;
    const justified = attendances.filter((attendance) => attendance.status === "justified").length;
    return {
      sessions: sessions.length,
      upcoming: sessions.filter((session) => session.status === "scheduled" && new Date(session.scheduledAt).getTime() >= Date.now()).length,
      total,
      present,
      absent,
      justified,
      rate: total ? Math.round((present / total) * 100) : 0,
    };
  }, [attendances, sessions]);

  const filteredSessions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const now = Date.now();
    return sessions.filter((session) => {
      const course = courses.find((item) => item.id === session.courseId);
      const matchesSearch = !normalizedSearch || `${session.title} ${session.description || ""} ${course?.title || ""}`.toLowerCase().includes(normalizedSearch);
      const matchesCourse = courseFilter === "all" || String(session.courseId) === courseFilter;
      const matchesModality = modalityFilter === "all" || session.modality === modalityFilter;
      const matchesStatus = statusFilter === "all" || session.status === statusFilter;
      const timestamp = new Date(session.scheduledAt).getTime();
      const matchesDate = dateFilter === "all" || (dateFilter === "upcoming" && timestamp >= now) || (dateFilter === "past" && timestamp < now);
      return matchesSearch && matchesCourse && matchesModality && matchesStatus && matchesDate;
    });
  }, [courses, courseFilter, dateFilter, modalityFilter, search, sessions, statusFilter]);

  const resetFilters = () => {
    setSearch("");
    setCourseFilter("all");
    setModalityFilter("all");
    setStatusFilter("all");
    setDateFilter("all");
  };

  const setAllStudentsStatus = (status: "present" | "absent" | "justified") => {
    const next: Record<number, "present" | "absent" | "justified"> = {};
    students.forEach((student) => {
      next[student.id] = status;
    });
    setAttendanceMap(next);
  };

  const handleCreateSession = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title || !scheduledAt) {
      toast.error("Informe o título e a data/horário da aula.");
      return;
    }

    try {
      setSubmitting(true);
      const attendanceRecords = Object.entries(attendanceMap).map(([studentId, status]) => ({ studentId: Number(studentId), status }));
      const res = await fetch("/api/admin/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: courseId ? Number(courseId) : null, title, description, modality, scheduledAt, durationMinutes: Number(durationMinutes), attendanceRecords }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Erro ao salvar chamada.");
      toast.success(payload.message || "Chamada salva com sucesso!");
      setShowNewModal(false);
      setTitle("");
      setDescription("");
      setCourseId("");
      setScheduledAt("");
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar chamada.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-28 rounded-3xl bg-white" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4"><div className="h-28 rounded-2xl bg-white" /><div className="h-28 rounded-2xl bg-white" /><div className="h-28 rounded-2xl bg-white" /><div className="h-28 rounded-2xl bg-white" /></div>
          <div className="h-96 rounded-2xl bg-white" />
        </div>
      </div>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "professor")) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-16 text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Link href="/admin" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-gray-500 transition hover:text-red-600"><ChevronLeft size={16} /> Painel administrativo</Link>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-black tracking-tight text-gray-950">Chamada online</h1>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Operação acadêmica</span>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">Organize sessões, registre a frequência e tenha uma visão rápida do acompanhamento das turmas.</p>
            </div>
            <Button onClick={() => setShowNewModal(true)} className="h-11 rounded-xl bg-red-600 px-5 font-bold text-white shadow-sm transition hover:bg-red-700"><Plus size={18} /> Nova chamada</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-wide text-gray-500">Sessões</p><Calendar size={18} className="text-red-600" /></div><p className="mt-3 text-2xl font-black">{metrics.sessions}</p><p className="mt-1 text-xs text-gray-500">{metrics.upcoming} agendada(s)</p></div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-wide text-gray-500">Frequência</p><BarChart3 size={18} className="text-emerald-600" /></div><p className="mt-3 text-2xl font-black text-emerald-700">{metrics.rate}%</p><p className="mt-1 text-xs text-gray-500">{metrics.present} presença(s) registrada(s)</p></div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-wide text-gray-500">Ausências</p><XCircle size={18} className="text-red-600" /></div><p className="mt-3 text-2xl font-black text-red-700">{metrics.absent}</p><p className="mt-1 text-xs text-gray-500">faltas registradas</p></div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-wide text-gray-500">Justificativas</p><Users size={18} className="text-amber-600" /></div><p className="mt-3 text-2xl font-black text-amber-700">{metrics.justified}</p><p className="mt-1 text-xs text-gray-500">presenças justificadas</p></div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div><h2 className="text-base font-black">Histórico de sessões</h2><p className="mt-1 text-xs text-gray-500">Use os filtros para localizar uma turma ou revisar um período.</p></div>
            <button type="button" onClick={resetFilters} className="text-left text-xs font-bold text-red-600 hover:underline lg:text-right">Limpar filtros</button>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <label className="relative block xl:col-span-2"><Search size={16} className="absolute left-3 top-3 text-gray-400" /><span className="sr-only">Buscar sessão</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por título ou curso" className="h-10 w-full rounded-xl border border-gray-300 pl-9 pr-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100" /></label>
            <label className="relative block"><span className="sr-only">Filtrar por curso</span><select value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)} className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none focus:border-red-500"><option value="all">Todos os cursos</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label>
            <label className="relative block"><span className="sr-only">Filtrar por modalidade</span><select value={modalityFilter} onChange={(event) => setModalityFilter(event.target.value)} className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none focus:border-red-500"><option value="all">Todas as modalidades</option><option value="group">Em grupo</option><option value="individual">Individual</option><option value="hybrid">Híbrida</option></select></label>
            <label className="relative block"><span className="sr-only">Filtrar por período</span><select value={dateFilter} onChange={(event) => setDateFilter(event.target.value as DateFilter)} className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none focus:border-red-500"><option value="all">Todos os períodos</option><option value="upcoming">Próximas</option><option value="past">Já realizadas</option></select></label>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3"><Filter size={14} className="text-gray-400" /><span className="text-xs font-semibold text-gray-500">Status:</span>{(["all", "scheduled", "completed", "cancelled"] as StatusFilter[]).map((value) => <button key={value} type="button" onClick={() => setStatusFilter(value)} className={`rounded-full border px-3 py-1 text-xs font-bold transition ${statusFilter === value ? "border-red-600 bg-red-600 text-white" : "border-gray-200 bg-white text-gray-600 hover:border-red-200 hover:text-red-600"}`}>{value === "all" ? "Todos" : statusLabels[value]}</button>)}</div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between"><h2 className="text-lg font-black">{filteredSessions.length} {filteredSessions.length === 1 ? "sessão encontrada" : "sessões encontradas"}</h2><span className="text-xs text-gray-500">Dados atualizados agora</span></div>
          {filteredSessions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center shadow-sm"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400"><Search size={26} /></div><h3 className="mt-4 text-base font-bold">Nenhuma sessão corresponde aos filtros</h3><p className="mt-1 text-sm text-gray-500">Limpe os filtros ou crie uma nova chamada para começar.</p><Button type="button" variant="outline" onClick={resetFilters} className="mt-5 rounded-xl">Limpar filtros</Button></div>
          ) : (
            filteredSessions.map((session) => {
              const sessionAttendances = attendances.filter((attendance) => attendance.sessionId === session.id);
              const present = sessionAttendances.filter((attendance) => attendance.status === "present").length;
              const absent = sessionAttendances.filter((attendance) => attendance.status === "absent").length;
              const justified = sessionAttendances.filter((attendance) => attendance.status === "justified").length;
              const course = courses.find((item) => item.id === session.courseId);
              return (
                <article key={session.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:border-red-200 hover:shadow-md">
                  <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-start lg:justify-between lg:p-6">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-red-100 bg-red-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-red-700">{modalityLabels[session.modality]}</span><span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusBadge(session.status)}`}>{statusLabels[session.status]}</span>{course && <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-semibold text-gray-600"><GraduationCap size={13} /> {course.title}</span>}</div>
                      <h3 className="mt-3 text-xl font-black tracking-tight text-gray-950">{session.title}</h3>
                      {session.description && <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">{session.description}</p>}
                    </div>
                    <div className="shrink-0 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 lg:min-w-52 lg:text-right"><p className="flex items-center gap-2 text-sm font-bold text-gray-800 lg:justify-end"><Calendar size={16} className="text-red-600" /> {new Date(session.scheduledAt).toLocaleDateString("pt-BR")}</p><p className="mt-1 flex items-center gap-2 text-xs text-gray-500 lg:justify-end"><Clock3 size={14} /> {new Date(session.scheduledAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} · {session.durationMinutes} min</p></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 border-t border-gray-100 bg-gray-50/70 p-5 sm:grid-cols-4 lg:px-6"><div><p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Alunos na chamada</p><p className="mt-1 text-lg font-black text-gray-900">{sessionAttendances.length}</p></div><div><p className="text-[11px] font-bold uppercase tracking-wide text-emerald-600">Presentes</p><p className="mt-1 text-lg font-black text-emerald-700">{present}</p></div><div><p className="text-[11px] font-bold uppercase tracking-wide text-red-600">Ausentes</p><p className="mt-1 text-lg font-black text-red-700">{absent}</p></div><div><p className="text-[11px] font-bold uppercase tracking-wide text-amber-600">Justificados</p><p className="mt-1 text-lg font-black text-amber-700">{justified}</p></div></div>
                  {sessionAttendances.length > 0 && <div className="flex flex-wrap gap-2 border-t border-gray-100 p-5 lg:px-6">{sessionAttendances.map((attendance) => { const student = students.find((item) => item.id === attendance.studentId); const isPresent = attendance.status === "present"; const isAbsent = attendance.status === "absent"; return <span key={attendance.id} className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${isPresent ? "border-emerald-100 bg-emerald-50 text-emerald-700" : isAbsent ? "border-red-100 bg-red-50 text-red-700" : "border-amber-100 bg-amber-50 text-amber-700"}`}>{isPresent ? <Check size={13} /> : isAbsent ? <X size={13} /> : <Clock3 size={13} />}{student?.name || `Aluno #${attendance.studentId}`}</span>; })}</div>}
                </article>
              );
            })
          )}
        </section>
      </main>

      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-100 bg-white p-5 sm:p-6"><div><p className="text-xs font-bold uppercase tracking-widest text-red-600">Nova sessão</p><h2 className="mt-1 text-xl font-black">Registrar chamada de aula</h2><p className="mt-1 text-sm text-gray-500">Preencha os dados da sessão e marque a situação de cada aluno.</p></div><button type="button" aria-label="Fechar modal" onClick={() => setShowNewModal(false)} className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"><X size={20} /></button></div>
            <form onSubmit={handleCreateSession} className="space-y-5 p-5 sm:p-6">
              <div className="grid gap-4 md:grid-cols-2"><label className="block text-sm font-bold text-gray-700">Título da aula *<input type="text" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex.: Aula 04 — Speaking Practice" className="mt-2 h-11 w-full rounded-xl border border-gray-300 px-3 text-sm font-normal outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100" required /></label><label className="block text-sm font-bold text-gray-700">Curso relacionado<select value={courseId} onChange={(event) => setCourseId(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-normal outline-none focus:border-red-500"><option value="">Nenhum curso específico</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title} ({course.level})</option>)}</select></label></div>
              <div className="grid gap-4 md:grid-cols-3"><label className="block text-sm font-bold text-gray-700">Modalidade<select value={modality} onChange={(event) => setModality(event.target.value as "individual" | "group" | "hybrid")} className="mt-2 h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-normal outline-none focus:border-red-500"><option value="group">Em grupo</option><option value="individual">Individual</option><option value="hybrid">Híbrida</option></select></label><label className="block text-sm font-bold text-gray-700">Data e horário *<input type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-gray-300 px-3 text-sm font-normal outline-none focus:border-red-500" required /></label><label className="block text-sm font-bold text-gray-700">Duração (min)<input type="number" min="1" value={durationMinutes} onChange={(event) => setDurationMinutes(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-gray-300 px-3 text-sm font-normal outline-none focus:border-red-500" /></label></div>
              <label className="block text-sm font-bold text-gray-700">Descrição / tópicos abordados<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder="Resumo dos pontos trabalhados na aula..." className="mt-2 w-full rounded-xl border border-gray-300 p-3 text-sm font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" /></label>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-sm font-black">Registro de presença</h3><p className="mt-1 text-xs text-gray-500">O padrão é Presente. Ajuste apenas as exceções.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setAllStudentsStatus("present")} className="rounded-lg border border-emerald-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50">Todos presentes</button><button type="button" onClick={() => setAllStudentsStatus("absent")} className="rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-red-700 hover:bg-red-50">Todos ausentes</button></div></div>{students.length === 0 ? <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white p-5 text-center text-xs text-gray-500">Nenhum aluno cadastrado na plataforma.</div> : <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">{students.map((student) => <div key={student.id} className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate text-sm font-bold text-gray-900">{student.name || "Sem nome"}</p><p className="truncate text-xs text-gray-500">{student.email}</p></div><div className="grid grid-cols-3 gap-1.5"><button type="button" onClick={() => setAttendanceMap((current) => ({ ...current, [student.id]: "present" }))} className={`rounded-lg px-2 py-1.5 text-[11px] font-bold transition ${attendanceMap[student.id] === "present" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"}`}>Presente</button><button type="button" onClick={() => setAttendanceMap((current) => ({ ...current, [student.id]: "absent" }))} className={`rounded-lg px-2 py-1.5 text-[11px] font-bold transition ${attendanceMap[student.id] === "absent" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700"}`}>Ausente</button><button type="button" onClick={() => setAttendanceMap((current) => ({ ...current, [student.id]: "justified" }))} className={`rounded-lg px-2 py-1.5 text-[11px] font-bold transition ${attendanceMap[student.id] === "justified" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-700"}`}>Justificado</button></div></div>)}</div>}</div>
              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end"><Button type="button" variant="outline" onClick={() => setShowNewModal(false)} className="rounded-xl">Cancelar</Button><Button type="submit" disabled={submitting} className="rounded-xl bg-red-600 font-bold text-white hover:bg-red-700">{submitting && <Loader2 size={16} className="mr-2 animate-spin" />} Salvar chamada</Button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
