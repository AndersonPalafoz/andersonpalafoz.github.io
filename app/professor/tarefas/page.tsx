"use client";

import { useEffect, useState, useMemo, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, CheckSquare, Calendar, MessageCircle, Plus, Loader2, X, Filter, ArrowUpDown, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { buildWhatsAppMessageLink, buildDeadlineReminderText } from "@/lib/notifications-helper";

interface Activity {
  id: number;
  title: string;
  description: string | null;
  type: string;
  dueDate: string | null;
  status?: string;
  course: {
    id: number;
    title: string;
  } | null;
}

interface Course {
  id: number;
  title: string;
}

interface Student {
  id: number;
  name: string | null;
  phone: string | null;
}

export default function TeacherTasksPage() {
  const [activitiesList, setActivitiesList] = useState<Activity[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"dueDate" | "title" | "recent">("dueDate");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseId: "",
    type: "assignment",
    dueDate: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/professor/progress-speaking");
      const json = await res.json();
      if (res.ok && json.students) {
        setStudents(json.students);
      }

      const coursesRes = await fetch("/api/courses");
      const coursesJson = await coursesRes.json();
      if (coursesRes.ok) {
        setCourses(coursesJson);
      }

      // Buscar atividades reais
      const actRes = await fetch("/api/admin/atividades");
      if (actRes.ok) {
        const actJson = await actRes.json();
        setActivitiesList(actJson.activities || actJson || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const handleCreateActivity = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.courseId || !formData.type) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/professor/tarefas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao criar tarefa.");

      toast.success("Tarefa e deadline criados com sucesso!");
      setFormData({ title: "", description: "", courseId: "", type: "assignment", dueDate: "" });
      setShowForm(false);
      void fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar tarefa.");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (activity: Activity) => {
    setActivityToDelete(activity);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!activityToDelete) return;
    try {
      const res = await fetch(`/api/admin/atividades?id=${activityToDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao excluir tarefa");
      toast.success("Tarefa excluída com sucesso.");
      setActivitiesList((current) => current.filter((a) => a.id !== activityToDelete.id));
    } catch (err) {
      toast.error("Erro ao excluir tarefa.");
    } finally {
      setDeleteModalOpen(false);
      setActivityToDelete(null);
    }
  };

  // Filtragem e Ordenação
  const filteredActivities = useMemo(() => {
    let list = [...activitiesList];
    if (filterStatus === "pending") {
      list = list.filter((a) => !a.dueDate || new Date(a.dueDate) >= new Date());
    } else if (filterStatus === "expired") {
      list = list.filter((a) => a.dueDate && new Date(a.dueDate) < new Date());
    }

    list.sort((a, b) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      } else if (sortBy === "dueDate") {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        return dateA - dateB;
      } else {
        return b.id - a.id;
      }
    });

    return list;
  }, [activitiesList, filterStatus, sortBy]);

  const totalCount = activitiesList.length;
  const completedCount = activitiesList.filter((a) => a.dueDate && new Date(a.dueDate) < new Date()).length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <div>
            <Link href="/professor" className="text-sm font-semibold text-red-600 hover:underline flex items-center gap-1 mb-2">
              <ArrowLeft size={16} /> Voltar ao Painel do Professor
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <CheckSquare className="text-red-600" size={32} />
              Gerenciamento de Tarefas e Deadlines
            </h1>
            <p className="text-gray-600 mt-1">
              Monitore prazos de entrega, organize com filtros e acompanhe o progresso geral das entregas.
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-red-600 hover:bg-red-700 text-white font-semibold">
            <Plus size={18} className="mr-2" /> Nova Tarefa / Deadline
          </Button>
        </div>

        {/* Barra de Progresso Visual de Tarefas */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-gray-800">Progresso Geral de Prazos Concluídos</span>
            <span className="font-bold text-red-600">{completedCount}/{totalCount} finalizadas ({progressPercentage}%)</span>
          </div>
          <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
            <div className="bg-red-600 h-3 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleCreateActivity} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Cadastrar Nova Tarefa</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-650">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Título da Tarefa</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Redação sobre Verb Tenses"
                  className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Curso Vinculado</label>
                <select
                  required
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-white focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition"
                >
                  <option value="">Selecione um curso...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Atividade</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-white focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition"
                >
                  <option value="assignment">Assignment (Tarefa)</option>
                  <option value="quiz">Quiz</option>
                  <option value="speaking">Speaking (Fala)</option>
                  <option value="listening">Listening (Audição)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Data e Hora Limite (Deadline)</label>
                <input
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Instruções / Descrição</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detalhes e orientações para o aluno..."
                className="w-full p-4 rounded-xl border border-gray-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none transition"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button type="submit" disabled={submitting} className="bg-red-600 hover:bg-red-700 text-white font-semibold">
                {submitting ? <><Loader2 className="animate-spin mr-2" size={18} /> Salvando...</> : "Salvar Tarefa"}
              </Button>
            </div>
          </form>
        )}

        {/* Filtros e Ordenação */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-900">Atividades Cadastradas e Prazos</h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-gray-300 bg-white text-sm font-medium outline-none"
                >
                  <option value="all">Todas as tarefas</option>
                  <option value="pending">No prazo</option>
                  <option value="expired">Encerradas</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <ArrowUpDown size={16} className="text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="h-10 px-3 rounded-xl border border-gray-300 bg-white text-sm font-medium outline-none"
                >
                  <option value="dueDate">Ordenar por Prazo</option>
                  <option value="title">Ordenar por Título</option>
                  <option value="recent">Mais Recentes</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-red-600" size={32} /></div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CheckSquare className="mx-auto text-gray-300 mb-3" size={36} />
              <p className="font-semibold text-gray-800">Nenhuma tarefa encontrada com os filtros selecionados.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map((act) => {
                const dueDateFormatted = act.dueDate
                  ? new Date(act.dueDate).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Sem prazo definido";

                const sampleStudent = students[0];
                const waLink = sampleStudent?.phone
                  ? buildWhatsAppMessageLink(
                      sampleStudent.phone,
                      buildDeadlineReminderText(act.title, act.dueDate || new Date(), act.course?.title || "Curso")
                    )
                  : "#";

                return (
                  <div key={act.id} className="p-6 rounded-xl bg-gray-50 border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-red-100 text-red-600">
                          {act.type}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">Curso: {act.course?.title || "Geral"}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg">{act.title}</h3>
                      <p className="text-sm text-gray-600">{act.description || "Sem descrição informada."}</p>
                      <p className="text-xs text-red-600 font-semibold flex items-center gap-1 pt-1">
                        <Calendar size={14} /> Prazo: {dueDateFormatted}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {sampleStudent?.phone && (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-xs transition inline-flex items-center gap-1.5"
                        >
                          <MessageCircle size={14} /> WhatsApp
                        </a>
                      )}
                      <button
                        onClick={() => confirmDelete(act)}
                        className="p-2 rounded-xl border border-red-200 bg-white text-red-600 hover:bg-red-50 transition"
                        title="Excluir tarefa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal de Confirmação de Exclusão */}
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6 shadow-xl border border-gray-200">
              <div className="flex items-center gap-3 text-red-600">
                <AlertTriangle size={28} />
                <h3 className="text-lg font-bold text-gray-900">Confirmar Exclusão</h3>
              </div>
              <p className="text-sm text-gray-600">
                Tem certeza que deseja excluir a tarefa <b className="text-gray-900">{activityToDelete?.title}</b>? Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancelar</Button>
                <Button onClick={executeDelete} className="bg-red-600 hover:bg-red-700 text-white font-semibold">
                  Sim, Excluir
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
