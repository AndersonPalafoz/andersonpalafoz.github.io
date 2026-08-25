"use client";

import { useEffect, useState, useMemo, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, CheckSquare, Calendar, Loader2, Filter, Trash2, AlertTriangle, Edit3, GripVertical, Moon, Sun, Save, Search, Download, FileText, CheckCircle2, Circle, Link2, Paperclip, ChevronDown, ChevronUp, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { buildWhatsAppMessageLink, buildDeadlineReminderText } from "@/lib/notifications-helper";
import { createTablePdf, downloadPdf } from "@/lib/pdf-export";

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

interface Attachment {
  id: string;
  name: string;
  url: string;
}

interface Activity {
  id: number;
  title: string;
  description: string | null;
  type: string;
  dueDate: string | null;
  tag?: string;
  status?: "pending" | "completed" | null;
  order?: number;
  subtasks?: SubTask[] | null;
  attachments?: Attachment[] | null;
  course: {
    id: number;
    title: string;
  } | null;
}

interface Course {
  id: number;
  title: string;
}

const AVAILABLE_TAGS = [
  { name: "Urgente", color: "bg-red-100 text-red-700 border-red-300 hover:bg-red-200" },
  { name: "Gramática", color: "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200" },
  { name: "Conversação", color: "bg-green-100 text-green-700 border-green-300 hover:bg-green-200" },
  { name: "Vocabulário", color: "bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200" },
  { name: "Avaliação", color: "bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200" },
];

export default function TeacherTasksPage() {
  const [activitiesList, setActivitiesList] = useState<Activity[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTagFilter, setSelectedTagFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"dueDate" | "title" | "recent">("dueDate");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);
  
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editTag, setEditTag] = useState("");
  const [editStatus, setEditStatus] = useState<"pending" | "completed">("pending");

  const [newSubtaskText, setNewSubtaskText] = useState("");
  const [formSubtasks, setFormSubtasks] = useState<SubTask[]>([]);
  const [newAttachmentName, setNewAttachmentName] = useState("");
  const [newAttachmentUrl, setNewAttachmentUrl] = useState("");
  const [formAttachments, setFormAttachments] = useState<Attachment[]>([]);

  const [darkMode, setDarkMode] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseId: "",
    type: "assignment",
    dueDate: "",
    tag: "Gramática",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const coursesRes = await fetch("/api/professor/courses");
      const coursesJson = await coursesRes.json();
      if (coursesRes.ok) {
        setCourses(coursesJson);
      }

      const actRes = await fetch("/api/admin/atividades");
      if (actRes.ok) {
        const actJson = await actRes.json();
        const list = (actJson.activities || actJson || []).map((a: any) => ({
          ...a,
          tag: typeof a.tag === "string" ? a.tag : null,
          status: a.status === "pending" || a.status === "completed" ? a.status : null,
          subtasks: Array.isArray(a.subtasks) ? a.subtasks : null,
          attachments: Array.isArray(a.attachments) ? a.attachments : null,
        }));
        setActivitiesList(list);
        const initialExpanded: Record<number, boolean> = {};
        list.forEach((a: Activity) => { initialExpanded[a.id] = true; });
        setExpandedCards(initialExpanded);
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

  const toggleCardExpand = (id: number) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddFormSubtask = () => {
    if (!newSubtaskText.trim()) return;
    setFormSubtasks([...formSubtasks, { id: Date.now().toString(), title: newSubtaskText.trim(), completed: false }]);
    setNewSubtaskText("");
  };

  const handleRemoveFormSubtask = (id: string) => {
    setFormSubtasks(formSubtasks.filter(s => s.id !== id));
  };

  const handleAddFormAttachment = () => {
    if (!newAttachmentName.trim() || !newAttachmentUrl.trim()) {
      toast.error("Informe o nome e o link/URL do anexo.");
      return;
    }
    setFormAttachments([...formAttachments, { id: Date.now().toString(), name: newAttachmentName.trim(), url: newAttachmentUrl.trim() }]);
    setNewAttachmentName("");
    setNewAttachmentUrl("");
  };

  const handleRemoveFormAttachment = (id: string) => {
    setFormAttachments(formAttachments.filter(a => a.id !== id));
  };

  const handleCreateActivity = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.courseId || !formData.type) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        subtasks: formSubtasks,
        attachments: formAttachments,
      };

      const res = await fetch("/api/professor/tarefas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao criar tarefa.");

      toast.success("Tarefa com checklist e anexos criada com sucesso!");
      setFormData({ title: "", description: "", courseId: "", type: "assignment", dueDate: "", tag: "Gramática" });
      setFormSubtasks([]);
      setFormAttachments([]);
      setShowForm(false);
      void fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar tarefa.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSubtask = async (activityId: number, subtaskId: string) => {
    const current = activitiesList.find((act) => act.id === activityId);
    if (!current) return;
    const subtasks = (current.subtasks || []).map((s) => s.id === subtaskId ? { ...s, completed: !s.completed } : s);
    setActivitiesList((items) => items.map((act) => act.id === activityId ? { ...act, subtasks } : act));
    try {
      const res = await fetch("/api/admin/atividades", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: activityId, subtasks }) });
      if (!res.ok) throw new Error("Falha ao salvar checklist");
      toast.success("Checklist atualizado!");
    } catch {
      toast.error("Não foi possível salvar o checklist.");
      void fetchData();
    }
  };

  const startEdit = (act: Activity) => {
    setEditingId(act.id);
    setEditTitle(act.title);
    setEditDueDate(act.dueDate ? new Date(act.dueDate).toISOString().slice(0, 16) : "");
    setEditTag(act.tag || "");
    setEditStatus(act.status === "completed" ? "completed" : "pending");
  };

  const duplicateActivity = async (activity: Activity) => {
    try {
      const res = await fetch("/api/professor/tarefas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Cópia — ${activity.title}`,
          description: activity.description,
          courseId: activity.course?.id,
          type: activity.type,
          dueDate: activity.dueDate,
          tag: activity.tag,
          subtasks: (activity.subtasks || []).map((item) => ({ ...item, id: `${Date.now()}-${item.id}`, completed: false })),
          attachments: activity.attachments || [],
        }),
      });
      if (!res.ok) throw new Error("Falha ao duplicar tarefa");
      toast.success("Tarefa duplicada com checklist e etiquetas.");
      void fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível duplicar a tarefa.");
    }
  };

  const saveEdit = async (id: number) => {
    try {
      const res = await fetch("/api/admin/atividades", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title: editTitle, dueDate: editDueDate, tag: editTag, status: editStatus }),
      });
      if (!res.ok) throw new Error("Falha ao atualizar");
      toast.success("Tarefa atualizada com sucesso!");
      setEditingId(null);
      void fetchData();
    } catch {
      toast.error("Erro ao atualizar tarefa.");
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
    } catch {
      toast.error("Erro ao excluir tarefa.");
    } finally {
      setDeleteModalOpen(false);
      setActivityToDelete(null);
    }
  };

  const exportToCSV = () => {
    if (activitiesList.length === 0) {
      toast.error("Não há tarefas para exportar.");
      return;
    }
    const headers = ["ID", "Titulo", "Tipo", "Curso", "Prazo", "Etiqueta"];
    const rows = activitiesList.map((a) => [
      a.id,
      `"${(a.title || "").replace(/"/g, '""')}"`,
      a.type,
      `"${(a.course?.title || "Geral").replace(/"/g, '""')}"`,
      a.dueDate ? new Date(a.dueDate).toLocaleString("pt-BR") : "Sem prazo",
      a.tag || "Nenhuma",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tarefas_anderson_palafoz_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Lista exportada para CSV com sucesso!");
  };

  const exportToPDF = async () => {
    if (activitiesList.length === 0) {
      toast.error("Não há tarefas para exportar.");
      return;
    }
    try {
      const bytes = await createTablePdf("Relatório de tarefas — Anderson Palafoz", ["Título", "Curso", "Prazo", "Status", "Etiqueta"], activitiesList.map((activity) => [
        activity.title,
        activity.course?.title || "Geral",
        activity.dueDate ? new Date(activity.dueDate).toLocaleString("pt-BR") : "Sem prazo",
        activity.status === "completed" ? "Concluída" : "Pendente",
        activity.tag || "Nenhuma",
      ]));
      downloadPdf(bytes, `tarefas-anderson-palafoz-${Date.now()}.pdf`);
      toast.success("Lista exportada para PDF com sucesso!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível gerar o PDF.");
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const updated = [...activitiesList];
    const itemMoved = updated.splice(draggedIndex, 1)[0];
    updated.splice(index, 0, itemMoved);
    setDraggedIndex(index);
    setActivitiesList(updated);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    try {
      await Promise.all(activitiesList.map((activity, index) => fetch("/api/admin/atividades", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: activity.id, order: index }) })));
      toast.success("Ordem das tarefas atualizada e salva!");
    } catch {
      toast.error("Não foi possível salvar a nova ordem.");
      void fetchData();
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 text-gray-900 px-0.5 rounded font-bold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const filteredActivities = useMemo(() => {
    let list = [...activitiesList];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((a) => a.title.toLowerCase().includes(q) || (a.description && a.description.toLowerCase().includes(q)));
    }

    if (filterStatus === "pending") {
      list = list.filter((a) => a.status !== "completed" && (!a.dueDate || new Date(a.dueDate) >= new Date()));
    } else if (filterStatus === "expired") {
      list = list.filter((a) => a.status !== "completed" && a.dueDate && new Date(a.dueDate) < new Date());
    } else if (filterStatus === "completed") {
      list = list.filter((a) => a.status === "completed");
    }

    if (selectedTagFilter !== "all") {
      list = list.filter((a) => a.tag === selectedTagFilter);
    }

    if (sortBy === "title") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "dueDate") {
      list.sort((a, b) => {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        return dateA - dateB;
      });
    }

    return list;
  }, [activitiesList, searchQuery, filterStatus, selectedTagFilter, sortBy]);

  const totalCount = activitiesList.length;
  const completedCount = activitiesList.filter((a) => a.status === "completed").length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      <div className="max-w-7xl mx-auto py-12 px-4 md:px-8 lg:px-12 space-y-8">
        <div className={`p-8 rounded-2xl shadow-sm border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <div>
            <Link href="/professor" className="text-sm font-semibold text-red-600 hover:underline flex items-center gap-1 mb-2">
              <ArrowLeft size={16} /> Voltar ao Painel do Professor
            </Link>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <CheckSquare className="text-red-600" size={32} />
              Gerenciamento de Tarefas, Checklists e Anexos
            </h1>
            <p className={`mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Barra de progresso por card, subtarefas recolhíveis, busca destacada, etiquetas e exportação CSV/PDF.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={exportToCSV}
              className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-xs transition inline-flex items-center gap-1.5"
            >
              <Download size={14} /> Exportar CSV
            </button>
            <button
              onClick={exportToPDF}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition inline-flex items-center gap-1.5"
            >
              <FileText size={14} /> Exportar PDF
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-3 rounded-xl border transition ${darkMode ? "border-gray-700 bg-gray-700 text-yellow-400 hover:bg-gray-600" : "border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Button onClick={() => setShowForm(!showForm)} className="bg-red-600 hover:bg-red-700 text-white font-bold h-11 px-6 rounded-xl shadow-md">
              {showForm ? "Fechar Formulário" : "+ Nova Tarefa"}
            </Button>
          </div>
        </div>

        {/* Barra de Progresso Geral */}
        <div className={`p-6 rounded-2xl border shadow-sm space-y-3 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <div className="flex justify-between items-center text-sm font-bold">
            <span>Progresso Geral da Conclusão de Tarefas</span>
            <span className="text-red-600">{completedCount} de {totalCount} concluídas ({progressPercentage}%)</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
            <div className="bg-red-600 h-full transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>

        {/* Formulário de Criação Completo */}
        {showForm && (
          <form onSubmit={handleCreateActivity} className={`p-8 rounded-2xl border shadow-sm space-y-6 animate-in fade-in ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
            <h2 className="text-xl font-bold">Criar Nova Tarefa / Deadline</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Título da Tarefa *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Entrega de Redação - Módulo 2"
                  className={`w-full h-11 px-4 rounded-xl border text-sm outline-none ${darkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-gray-50 border-gray-300"}`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Curso Vinculado *</label>
                <select
                  required
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className={`w-full h-11 px-4 rounded-xl border text-sm outline-none ${darkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-gray-50 border-gray-300"}`}
                >
                  <option value="">Selecione o Curso...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Data e Hora de Vencimento *</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className={`w-full h-11 px-4 rounded-xl border text-sm outline-none ${darkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-gray-50 border-gray-300"}`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Etiqueta / Categoria</label>
                <select
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  className={`w-full h-11 px-4 rounded-xl border text-sm outline-none ${darkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-gray-50 border-gray-300"}`}
                >
                  {AVAILABLE_TAGS.map((t) => (
                    <option key={t.name} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Descrição / Instruções</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Orientações detalhadas para os alunos realizarem a atividade..."
                  rows={3}
                  className={`w-full p-4 rounded-xl border text-sm outline-none ${darkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-gray-50 border-gray-300"}`}
                />
              </div>
            </div>

            {/* Subtarefas / Checklists no Form */}
            <details open className="border-t pt-4">
              <summary className="cursor-pointer list-none font-bold text-sm">Subtarefas / Checklist Inicial <span className="ml-1 text-[10px] font-normal text-gray-500">Toque para recolher</span></summary>
              <div className="mt-3 space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubtaskText}
                  onChange={(e) => setNewSubtaskText(e.target.value)}
                  placeholder="Adicionar item ao checklist..."
                  className={`flex-1 h-10 px-3 rounded-xl border text-xs outline-none ${darkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-gray-50 border-gray-300"}`}
                />
                <Button type="button" onClick={handleAddFormSubtask} size="sm" className="bg-gray-800 hover:bg-gray-900 text-white h-10 px-4">
                  Adicionar Item
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {formSubtasks.map((st) => (
                  <span key={st.id} className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-xs font-semibold">
                    {st.title}
                    <button type="button" onClick={() => handleRemoveFormSubtask(st.id)} className="text-red-500 hover:text-red-700 font-bold">×</button>
                  </span>
                ))}
              </div>
              </div>
            </details>

            {/* Anexos no Form */}
            <details open className="border-t pt-4">
              <summary className="cursor-pointer list-none font-bold text-sm">Anexos e Links de Referência <span className="ml-1 text-[10px] font-normal text-gray-500">Toque para recolher</span></summary>
              <div className="mt-3 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newAttachmentName}
                  onChange={(e) => setNewAttachmentName(e.target.value)}
                  placeholder="Nome do Material (Ex: PDF Aula)"
                  className={`h-10 px-3 rounded-xl border text-xs outline-none ${darkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-gray-50 border-gray-300"}`}
                />
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newAttachmentUrl}
                    onChange={(e) => setNewAttachmentUrl(e.target.value)}
                    placeholder="URL (https://...)"
                    className={`flex-1 h-10 px-3 rounded-xl border text-xs outline-none ${darkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-gray-50 border-gray-300"}`}
                  />
                  <Button type="button" onClick={handleAddFormAttachment} size="sm" className="bg-gray-800 hover:bg-gray-900 text-white h-10 px-4">
                    Anexar
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {formAttachments.map((att) => (
                  <span key={att.id} className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-xs font-semibold">
                    <Paperclip size={12} /> {att.name}
                    <button type="button" onClick={() => handleRemoveFormAttachment(att.id)} className="text-red-500 hover:text-red-700 font-bold">×</button>
                  </span>
                ))}
              </div>
              </div>
            </details>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-gray-300">
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting} className="bg-red-600 hover:bg-red-700 text-white font-bold h-11 px-8 rounded-xl">
                {submitting ? <Loader2 className="animate-spin mr-2" size={16} /> : null} Salvar Tarefa
              </Button>
            </div>
          </form>
        )}

        {/* Barra de Pesquisa, Filtros e Ordenação */}
        <div className={`p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Pesquisar tarefas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full h-10 pl-9 pr-4 rounded-xl border text-xs font-medium outline-none ${darkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-gray-50 border-gray-300"}`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1 text-xs font-bold text-gray-400">
              <Filter size={14} /> Filtros:
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`h-10 px-3 rounded-xl border text-xs font-semibold ${darkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-gray-50 border-gray-300"}`}
            >
              <option value="all">Todos os Prazos</option>
              <option value="pending">No Prazo</option>
              <option value="expired">Atrasadas</option>
              <option value="completed">Concluídas</option>
            </select>

            <select
              value={selectedTagFilter}
              onChange={(e) => setSelectedTagFilter(e.target.value)}
              className={`h-10 px-3 rounded-xl border text-xs font-semibold ${darkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-gray-50 border-gray-300"}`}
            >
              <option value="all">Todas as Tags</option>
              {AVAILABLE_TAGS.map((t) => (
                <option key={t.name} value={t.name}>{t.name}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={`h-10 px-3 rounded-xl border text-xs font-semibold ${darkMode ? "bg-gray-900 border-gray-700 text-white" : "bg-gray-50 border-gray-300"}`}
            >
              <option value="dueDate">Ordenar por Prazo</option>
              <option value="title">Ordenar por Título</option>
            </select>
          </div>
        </div>

        {/* Lista de Tarefas (Cards com Arrastar e Soltar, Progresso, Recolhíveis) */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Carregando tarefas...</div>
          ) : filteredActivities.length === 0 ? (
            <div className={`p-12 text-center rounded-2xl border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-400" : "bg-white border-gray-200 text-gray-500"}`}>
              Nenhuma tarefa encontrada.
            </div>
          ) : (
            filteredActivities.map((act, index) => {
              const now = new Date();
              const dueDateValue = act.dueDate ? new Date(act.dueDate) : null;
              const isExpired = Boolean(dueDateValue && dueDateValue < now && act.status !== "completed");
              const isDueToday = Boolean(dueDateValue && dueDateValue.toDateString() === now.toDateString() && act.status !== "completed");
              const tagObj = AVAILABLE_TAGS.find((t) => t.name === act.tag) || AVAILABLE_TAGS[1];
              const isExpanded = expandedCards[act.id] ?? true;

              const subList = act.subtasks || [];
              const subDone = subList.filter(s => s.completed).length;
              const subTotal = subList.length;
              const cardProgress = subTotal > 0 ? Math.round((subDone / subTotal) * 100) : 0;

              return (
                <div
                  key={act.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`p-6 rounded-2xl border shadow-sm transition space-y-4 cursor-grab active:cursor-grabbing ${
                    isExpired
                      ? darkMode ? "bg-red-950/20 border-red-900" : "bg-red-50/50 border-red-200"
                      : darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="text-gray-400 hover:text-gray-600 mt-1">
                        <GripVertical size={18} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${tagObj.color}`}>
                            {act.tag}
                          </span>
                          {act.course && (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                              {act.course.title}
                            </span>
                          )}
                          {act.status === "completed" ? (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1"><CheckCircle2 size={12} /> Concluída</span>
                          ) : isExpired ? (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600 text-white flex items-center gap-1"><AlertTriangle size={12} /> Atrasada</span>
                          ) : isDueToday ? (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1"><AlertTriangle size={12} /> Vence hoje</span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-green-100 text-green-700 flex items-center gap-1">No prazo</span>
                          )}
                        </div>

                        {editingId === act.id ? (
                          <div className="flex items-center gap-2 pt-2">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="px-3 py-1 rounded-lg border text-sm font-bold bg-white text-gray-950 w-64"
                            />
                            <input
                              type="datetime-local"
                              value={editDueDate}
                              onChange={(e) => setEditDueDate(e.target.value)}
                              className="px-3 py-1 rounded-lg border text-xs bg-white text-gray-950"
                            />
                            <select
                              value={editTag}
                              onChange={(e) => setEditTag(e.target.value)}
                              className="px-2 py-1 rounded-lg border text-xs bg-white text-gray-950"
                            >
                              {AVAILABLE_TAGS.map((t) => (
                                <option key={t.name} value={t.name}>{t.name}</option>
                              ))}
                            </select>
                            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as "pending" | "completed")} className="px-2 py-1 rounded-lg border text-xs bg-white text-gray-950">
                              <option value="pending">Pendente</option>
                              <option value="completed">Concluída</option>
                            </select>
                            <Button size="sm" onClick={() => saveEdit(act.id)} className="bg-green-600 hover:bg-green-700 text-white h-8">
                              <Save size={14} />
                            </Button>
                          </div>
                        ) : (
                          <h3 className="text-base font-extrabold tracking-tight mt-1">
                            {highlightText(act.title, searchQuery)}
                          </h3>
                        )}

                        {act.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {highlightText(act.description, searchQuery)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right mr-2 hidden sm:block">
                        <span className="text-xs font-bold text-gray-400 block">Prazo</span>
                        <span className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300">
                          {act.dueDate ? new Date(act.dueDate).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "Sem prazo"}
                        </span>
                      </div>

                      <a
                        href={buildWhatsAppMessageLink("5571999999999", buildDeadlineReminderText(act.title, act.dueDate ? new Date(act.dueDate) : new Date(), act.course?.title || "Geral"))}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition border border-green-200"
                        title="Enviar lembrete via WhatsApp"
                      >
                        <Calendar size={16} />
                      </a>

                      {editingId !== act.id && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => startEdit(act)} className="border-gray-300 dark:border-gray-700 text-xs font-semibold h-9"><Edit3 size={14} /></Button>
                          <Button variant="outline" size="sm" onClick={() => void duplicateActivity(act)} className="border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-semibold h-9" title="Duplicar tarefa"><Copy size={14} /></Button>
                        </>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => confirmDelete(act)}
                        className="border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold h-9"
                      >
                        <Trash2 size={14} />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCardExpand(act.id)}
                        className="h-9 w-9 p-0"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </Button>
                    </div>
                  </div>

                  {/* Subtarefas, Barra de Progresso por Card e Anexos (Recolhível) */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-4 animate-in fade-in">
                      {/* Barra de progresso específica do card */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                          <span>Checklist da Tarefa ({subDone}/{subTotal})</span>
                          <span>{cardProgress}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${cardProgress}%` }} />
                        </div>
                      </div>

                      {/* Lista de subitens */}
                      {subList.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {subList.map((st) => (
                            <button
                              key={st.id}
                              onClick={() => toggleSubtask(act.id, st.id)}
                              className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold text-left transition ${
                                st.completed
                                  ? "bg-green-50 border-green-200 text-green-800 line-through"
                                  : darkMode ? "bg-gray-900 border-gray-700 text-gray-200" : "bg-gray-50 border-gray-200 text-gray-700"
                              }`}
                            >
                              {st.completed ? <CheckCircle2 size={14} className="text-green-600 shrink-0" /> : <Circle size={14} className="text-gray-400 shrink-0" />}
                              <span className="truncate">{st.title}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Anexos */}
                      {act.attachments && act.attachments.length > 0 && (
                        <div className="space-y-1.5 pt-2">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Anexos & Links de Referência</span>
                          <div className="flex flex-wrap gap-2">
                            {act.attachments.map((att, idx) => (
                              <a
                                key={idx}
                                href={att.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-bold text-red-600 hover:underline"
                              >
                                <Paperclip size={12} /> {att.name} <Link2 size={12} className="text-gray-400 ml-1" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal de Confirmação de Exclusão */}
        {deleteModalOpen && activityToDelete && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`max-w-md w-full rounded-3xl p-6 shadow-2xl border space-y-4 animate-in fade-in zoom-in-95 ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"}`}>
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertTriangle size={24} />
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-extrabold text-lg">Confirmar Exclusão de Tarefa</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Tem certeza que deseja excluir <b>{activityToDelete.title}</b>? Esta ação não pode ser desfeita.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setDeleteModalOpen(false)} className="flex-1 font-semibold border-gray-300 dark:border-gray-700">
                  Cancelar
                </Button>
                <Button onClick={executeDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold">
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
