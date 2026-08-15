"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, ChevronLeft, Clock, Loader2, Plus, Users, XCircle } from "lucide-react";
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
      data.students.forEach((s: Student) => {
        initialMap[s.id] = "present";
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

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !scheduledAt) {
      toast.error("Informe o título e a data/horário da aula.");
      return;
    }

    try {
      setSubmitting(true);
      const attendanceRecords = Object.entries(attendanceMap).map(([studentId, status]) => ({
        studentId: Number(studentId),
        status,
      }));

      const res = await fetch("/api/admin/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: courseId ? Number(courseId) : null,
          title,
          description,
          modality,
          scheduledAt,
          durationMinutes: Number(durationMinutes),
          attendanceRecords,
        }),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Erro ao salvar chamada.");

      toast.success(payload.message || "Chamada salva com sucesso!");
      setShowNewModal(false);
      setTitle("");
      setDescription("");
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar chamada.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="animate-spin text-red-600" size={32} /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <div>
            <Link href="/admin" className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-red-600">
              <ChevronLeft size={16} /> Voltar ao painel
            </Link>
            <h1 className="text-2xl font-black text-gray-900">Chamada Online & Frequência</h1>
            <p className="mt-1 text-sm text-gray-500">Realize a chamada dos alunos para aulas individuais ou em grupo nos diversos cursos.</p>
          </div>
          <Button onClick={() => setShowNewModal(true)} className="bg-red-600 hover:bg-red-700 text-white font-bold gap-2 rounded-xl">
            <Plus size={18} /> Nova Chamada
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        {showNewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-4">
                <h2 className="text-lg font-bold text-gray-900">Nova Chamada de Aula</h2>
                <button onClick={() => setShowNewModal(false)} className="text-gray-400 hover:text-gray-700"><XCircle size={22} /></button>
              </div>
              <form onSubmit={handleCreateSession} className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    Título da Aula *
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Aula 04 - Speaking Practice" className="mt-1 h-11 w-full rounded-xl border border-gray-300 px-3 text-sm outline-none focus:border-red-500" required />
                  </label>
                  <label className="block text-sm font-semibold text-gray-700">
                    Curso Relacionado
                    <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none focus:border-red-500">
                      <option value="">Nenhum curso específico</option>
                      {courses.map((c) => <option key={c.id} value={c.id}>{c.title} ({c.level})</option>)}
                    </select>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    Modalidade
                    <select value={modality} onChange={(e) => setModality(e.target.value as any)} className="mt-1 h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none focus:border-red-500">
                      <option value="group">Em Grupo</option>
                      <option value="individual">Individual</option>
                      <option value="hybrid">Híbrida</option>
                    </select>
                  </label>
                  <label className="block text-sm font-semibold text-gray-700">
                    Data e Horário *
                    <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-gray-300 px-3 text-sm outline-none focus:border-red-500" required />
                  </label>
                  <label className="block text-sm font-semibold text-gray-700">
                    Duração (min)
                    <input type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-gray-300 px-3 text-sm outline-none focus:border-red-500" />
                  </label>
                </div>

                <label className="block text-sm font-semibold text-gray-700">
                  Descrição / Tópicos Abordados
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Resumo dos pontos trabalhados na aula..." className="mt-1 w-full rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-red-500" />
                </label>

                <div className="border-t pt-4">
                  <h3 className="font-bold text-sm text-gray-900 mb-2">Lista de Alunos (Frequência)</h3>
                  {students.length === 0 ? (
                    <p className="text-xs text-gray-500">Nenhum aluno cadastrado na plataforma.</p>
                  ) : (
                    <div className="max-h-48 overflow-y-auto space-y-2 border rounded-xl p-3 bg-gray-50">
                      {students.map((st) => (
                        <div key={st.id} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-gray-200">
                          <div>
                            <p className="font-semibold text-sm text-gray-900">{st.name || "Sem nome"}</p>
                            <p className="text-xs text-gray-500">{st.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => setAttendanceMap({ ...attendanceMap, [st.id]: "present" })} className={`px-3 py-1 text-xs font-bold rounded-lg transition ${attendanceMap[st.id] === "present" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Presente</button>
                            <button type="button" onClick={() => setAttendanceMap({ ...attendanceMap, [st.id]: "absent" })} className={`px-3 py-1 text-xs font-bold rounded-lg transition ${attendanceMap[st.id] === "absent" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Ausente</button>
                            <button type="button" onClick={() => setAttendanceMap({ ...attendanceMap, [st.id]: "justified" })} className={`px-3 py-1 text-xs font-bold rounded-lg transition ${attendanceMap[st.id] === "justified" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Justificado</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setShowNewModal(false)}>Cancelar</Button>
                  <Button type="submit" disabled={submitting} className="bg-red-600 hover:bg-red-700 text-white font-bold">
                    {submitting && <Loader2 size={16} className="animate-spin mr-2" />} Salvar Chamada
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {sessions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
              <Calendar className="mx-auto text-gray-400" size={36} />
              <h3 className="mt-3 font-bold text-gray-900">Nenhuma chamada realizada</h3>
              <p className="mt-1 text-xs text-gray-500">Clique em "Nova Chamada" para registrar a frequência de uma aula.</p>
            </div>
          ) : (
            sessions.map((sess) => {
              const sessAttendances = attendances.filter((a) => a.sessionId === sess.id);
              const presentCount = sessAttendances.filter((a) => a.status === "present").length;
              const courseObj = courses.find((c) => c.id === sess.courseId);

              return (
                <div key={sess.id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-600 uppercase">{sess.modality}</span>
                        {courseObj && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">{courseObj.title}</span>}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mt-2">{sess.title}</h3>
                      {sess.description && <p className="text-xs text-gray-600 mt-1">{sess.description}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 flex items-center gap-1 justify-end"><Calendar size={14} /> {new Date(sess.scheduledAt).toLocaleString("pt-BR")}</p>
                      <p className="text-xs font-semibold text-gray-700 mt-1 flex items-center gap-1 justify-end"><Clock size={14} /> {sess.durationMinutes} minutos</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span className="font-bold flex items-center gap-1"><Users size={14} /> Frequência: {presentCount} / {sessAttendances.length} presentes</span>
                    <span className="font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-md">Concluída</span>
                  </div>

                  {sessAttendances.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-2 border-t">
                      {sessAttendances.map((att) => {
                        const st = students.find((s) => s.id === att.studentId);
                        const statusColor = att.status === "present" ? "bg-green-50 text-green-700 border-green-200" : att.status === "absent" ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200";
                        const statusText = att.status === "present" ? "Presente" : att.status === "absent" ? "Ausente" : "Justificado";
                        return (
                          <div key={att.id} className={`p-2 rounded-lg border text-xs flex items-center justify-between ${statusColor}`}>
                            <span className="font-semibold truncate max-w-[100px]">{st?.name || `Aluno #${att.studentId}`}</span>
                            <span className="font-bold px-1.5 py-0.5 rounded text-[10px] bg-white">{statusText}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
