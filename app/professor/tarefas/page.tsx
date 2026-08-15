"use client";

import { useEffect, useState, useMemo, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, CheckSquare, Calendar, MessageCircle, Plus, Loader2, X, Filter, ArrowUpDown, Trash2, AlertTriangle, Edit3, GripVertical, Moon, Sun, Save, Search, Download, Tag, FileText, CheckCircle2, Circle, Link2, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { buildWhatsAppMessageLink, buildDeadlineReminderText } from "@/lib/notifications-helper";

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
  subtasks?: SubTask[];
  attachments?: Attachment[];
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
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTagFilter, setSelectedTagFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"dueDate" | "title" | "recent">("dueDate");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);
  
  // Edição rápida
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editTag, setEditTag] = useState("");

  // Novo item de subtarefa / anexo no form de criação
  const [newSubtaskText, setNewSubtaskText] = useState("");
  const [formSubtasks, setFormSubtasks] = useState<SubTask[]>([]);
  const [newAttachmentName, setNewAttachmentName] = useState("");
  const [newAttachmentUrl, setNewAttachmentUrl] = useState("");
  const [formAttachments, setFormAttachments] = useState<Attachment[]>([]);

  // Dark mode
  const [darkMode, setDarkMode] = useState(false);

  // Drag and drop state
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

      const actRes = await fetch("/api/admin/atividades");
      if (actRes.ok) {
        const actJson = await actRes.json();
        const list = (actJson.activities || actJson || []).map((a: any) => ({
          ...a,
          tag: a.tag || "Gramática",
          subtasks: a.subtasks || [
            { id: "1", title: "Ler material de apoio", completed: false },
            { id: "2", title: "Submeter exercício", completed: false },
          ],
          attachments: a.attachments || [
            { id: "a1", name: "Guia PDF de Estudo", url: "https://andersonpalafoz.com.br/materiais" },
          ],
        }));
        setActivitiesList(list);
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
    const updated = activitiesList.map((act) => {
      if (act.id === activityId) {
        const subs = (act.subtasks || []).map((s) => s.id === subtaskId ? { ...s, completed: !s.completed } : s);
        return { ...act, subtasks: subs };
      }
      return act;
    });
    setActivitiesList(updated);
    toast.success("Checklist atualizado!");
  };

  const startEdit = (act: Activity) => {
    setEditingId(act.id);
    setEditTitle(act.title);
    setEditDueDate(act.dueDate ? new Date(act.dueDate).toISOString().slice(0, 16) : "");
    setEditTag(act.tag || "Gramática");
  };

  const saveEdit = async (id: number) => {
    try {
      const res = await fetch("/api/admin/atividades", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title: editTitle, dueDate: editDueDate, tag: editTag }),
      });
      if (!res.ok) throw new Error("Falha ao atualizar");
      toast.success("Tarefa atualizada com sucesso!");
      setEditingId(null);
      void fetchData();
    } catch (err) {
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
    } catch (err) {
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

  const exportToPDF = () => {
    window.print();
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

  const handleDragEnd = () => {
    setDraggedIndex(null);
    toast.success("Ordem das tarefas atualizada manualmente!");
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
      list = list.filter((a) => !a.dueDate || new Date(a.dueDate) >= new Date());
    } else if (filterStatus === "expired") {
      list = list.filter((a) => a.dueDate && new Date(a.dueDate) < new Date());
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
  const completedCount = activitiesList.filter((a) => a.dueDate && new Date(a.dueDate) < new Date()).length;
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
              Subtarefas interativas, links de referência, busca destacada, etiquetas e exportação CSV/PDF.
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
            <Button onClick={() => setShowForm(!showForm)} className="bg-red-600 hover:bg-red-700 text-white font-semibold">
              <Plus size={18} className="mr-2" /> Nova Tarefa com Checklist
            </Button>
          </div>
        </div>

        {/* Barra de Progresso Visual */}
        <div className={`p-6 rounded-2xl border shadow-sm space-y-3 transition-colors ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold">Progresso Geral de Prazos Concluídos</span>
            <span className="font-bold text-red-600">{completedCount}/{totalCount} finalizadas ({progressPercentage}%)</span>
          </div>
          <div className={`w-full h-3 rounded-full overflow-hidden ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
            <div className="bg-red-600 h-3 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleCreateActivity} className={`p-8 rounded-2xl border shadow-sm space-y-6 transition-colors ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Cadastrar Nova Tarefa com Subtarefas e Anexos</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Título da Tarefa</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Redação sobre Verb Tenses"
                  className={`w-full h-12 px-4 rounded-xl border outline-none transition ${darkMode ? "bg-gray-700 border-gray-600 text-white focus:border-red-500" : "bg-white border-gray-300 focus:border-red-600"}`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Curso Vinculado</label>
                <select
                  required
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className={`w-full h-12 px-4 rounded-xl border outline-none transition ${darkMode ? "bg-gray-700 border-gray-600 text-white focus:border-red-500" : "bg-white border-gray-300 focus:border-red-600"}`}
                >
                  <option value="">Selecione um curso...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Etiqueta (Tag)</label>
                <select
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  className={`w-full h-12 px-4 rounded-xl border outline-none transition ${darkMode ? "bg-gray-700 border-gray-600 text-white focus:border-red-500" : "bg-white border-gray-300 focus:border-red-600"}`}
                >
                  {AVAILABLE_TAGS.map((t) => (
                    <option key={t.name} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Tipo de Atividade</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className={`w-full h-12 px-4 rounded-xl border outline-none transition ${darkMode ? "bg-gray-700 border-gray-600 text-white focus:border-red-500" : "bg-white border-gray-300 focus:border-red-600"}`}
                >
                  <option value="assignment">Assignment (Tarefa)</option>
                  <option value="quiz">Quiz</option>
                  <option value="speaking">Speaking (Fala)</option>
                  <option value="listening">Listening (Audição)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Data e Hora Limite (Deadline)</label>
                <input
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className={`w-full h-12 px-4 rounded-xl border outline-none transition ${darkMode ? "bg-gray-700 border-gray-600 text-white focus:border-red-500" : "bg-white border-gray-300 focus:border-red-600"}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Instruções / Descrição</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detalhes e orientações para o aluno..."
                className={`w-full p-4 rounded-xl border outline-none transition ${darkMode ? "bg-gray-700 border-gray-600 text-white focus:border-red-500" : "bg-white border-gray-300 focus:border-red-600"}`}
              />
            </div>

            {/* Construtor de Checklist / Subtarefas */}
            <div className="p-4 rounded-xl border border-dashed border-gray-300 space-y-3">
              <label className="block text-sm font-bold">Subtarefas / Checklist</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubtaskText}
                  onChange={(e) => setNewSubtaskText(e.target.value)}
                  placeholder="Ex: Assistir aula 1 e anotar dúvidas..."
                  className={`flex-1 h-10 px-3 rounded-lg border text-sm outline-none ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                />
                <Button type="button" onClick={handleAddFormSubtask} size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                  Adicionar Item
                </Button>
              </div>
              {formSubtasks.length > 0 && (
                <ul className="space-y-1.5 pt-2">
                  {formSubtasks.map((st) => (
                    <li key={st.id} className="flex items-center justify-between text-sm px-3 py-1.5 rounded bg-gray-100 dark:bg-gray-700">
                      <span>• {st.title}</span>
                      <button type="button" onClick={() => handleRemoveFormSubtask(st.id)} className="text-red-500 hover:underline text-xs">Remover</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Construtor de Anexos de Referência */}
            <div className="p-4 rounded-xl border border-dashed border-gray-300 space-y-3">
              <label className="block text-sm font-bold">Links e Arquivos de Referência</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newAttachmentName}
                  onChange={(e) => setNewAttachmentName(e.target.value)}
                  placeholder="Nome do arquivo ou link (Ex: PDF de Vocabulário)"
                  className={`h-10 px-3 rounded-lg border text-sm outline-none ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                />
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newAttachmentUrl}
                    onChange={(e) => setNewAttachmentUrl(e.target.value)}
                    placeholder="URL (https://...)"
                    className={`flex-1 h-10 px-3 rounded-lg border text-sm outline-none ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                  />
                  <Button type="button" onClick={handleAddFormAttachment} size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                    Anexar
                  </Button>
                </div>
              </div>
              {formAttachments.length > 0 && (
                <ul className="space-y-1.5 pt-2">
                  {formAttachments.map((att) => (
                    <li key={att.id} className="flex items-center justify-between text-sm px-3 py-1.5 rounded bg-gray-100 dark:bg-gray-700">
                      <span className="flex items-center gap-1.5"><Paperclip size={14} className="text-blue-500" /> {att.name} ({att.url})</span>
                      <button type="button" onClick={() => handleRemoveFormAttachment(att.id)} className="text-red-500 hover:underline text-xs">Remover</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button type="submit" disabled={submitting} className="bg-red-600 hover:bg-red-700 text-white font-semibold">
                {submitting ? <><Loader2 className="animate-spin mr-2" size={18} /> Salvando...</> : "Salvar Tarefa"}
              </Button>
            </div>
          </form>
        )}

        {/* Lista de Atividades com Checklists Interativos e Anexos */}
        <div className={`p-6 rounded-2xl border shadow-sm space-y-6 transition-colors ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-xl font-bold">Atividades Cadastradas e Checklists</h2>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className={`h-10 px-3 rounded-xl border text-sm font-medium outline-none ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-700"}`}
                  >
                    <option value="all">Todos os status</option>
                    <option value="pending">No prazo</option>
                    <option value="expired">Encerradas</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-gray-400" />
                  <select
                    value={selectedTagFilter}
                    onChange={(e) => setSelectedTagFilter(e.target.value)}
                    className={`h-10 px-3 rounded-xl border text-sm font-medium outline-none ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-700"}`}
                  >
                    <option value="all">Todas as etiquetas (Clique na tag para filtrar)</option>
                    {AVAILABLE_TAGS.map((t) => (
                      <option key={t.name} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <ArrowUpDown size={16} className="text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className={`h-10 px-3 rounded-xl border text-sm font-medium outline-none ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-700"}`}
                  >
                    <option value="dueDate">Ordenar por Prazo</option>
                    <option value="title">Ordenar por Título</option>
                    <option value="recent">Mais Recentes</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Barra de Pesquisa */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Search size={18} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar tarefas por título ou descrição (termos encontrados serão destacados)..."
                className={`w-full h-12 pl-12 pr-4 rounded-xl border outline-none transition text-sm ${darkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-red-500" : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-red-600"}`}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-red-600" size={32} /></div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <CheckSquare className="mx-auto text-gray-500 mb-3" size={36} />
              <p className="font-semibold">Nenhuma tarefa encontrada com os filtros e busca informados.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map((act, idx) => {
                const dueDateFormatted = act.dueDate
                  ? new Date(act.dueDate).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Sem prazo definido";

                const isEditing = editingId === act.id;
                const tagInfo = AVAILABLE_TAGS.find((t) => t.name === act.tag) || AVAILABLE_TAGS[1];

                return (
                  <div
                    key={act.id}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`p-6 rounded-xl border flex flex-col gap-4 cursor-move transition-all ${darkMode ? "bg-gray-700/50 border-gray-600 hover:border-red-500" : "bg-gray-50 border-gray-200 hover:border-red-300"}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="text-gray-400 mt-1 cursor-grab active:cursor-grabbing">
                          <GripVertical size={20} />
                        </div>
                        <div className="space-y-1 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-red-100 text-red-700">
                              {act.type}
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedTagFilter(act.tag || "Gramática")}
                              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border cursor-pointer transition ${tagInfo.color}`}
                              title="Clique para filtrar por esta etiqueta"
                            >
                              🏷️ {act.tag || "Gramática"}
                            </button>
                            <span className="text-xs text-gray-400 font-medium">Curso: {act.course?.title || "Geral"}</span>
                          </div>

                          {isEditing ? (
                            <div className="space-y-3 pt-2">
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className={`w-full px-3 py-2 rounded-lg border text-sm outline-none ${darkMode ? "bg-gray-800 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                              />
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <input
                                  type="datetime-local"
                                  value={editDueDate}
                                  onChange={(e) => setEditDueDate(e.target.value)}
                                  className={`w-full px-3 py-2 rounded-lg border text-sm outline-none ${darkMode ? "bg-gray-800 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                                />
                                <select
                                  value={editTag}
                                  onChange={(e) => setEditTag(e.target.value)}
                                  className={`w-full px-3 py-2 rounded-lg border text-sm outline-none ${darkMode ? "bg-gray-800 border-gray-600 text-white" : "bg-white border-gray-300"}`}
                                >
                                  {AVAILABLE_TAGS.map((t) => (
                                    <option key={t.name} value={t.name}>{t.name}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex gap-2 pt-1">
                                <Button size="sm" onClick={() => saveEdit(act.id)} className="bg-green-600 hover:bg-green-700 text-white">
                                  <Save size={14} className="mr-1" /> Salvar
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <h3 className="font-bold text-lg">{highlightText(act.title, searchQuery)}</h3>
                              <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                                {highlightText(act.description || "Sem descrição informada.", searchQuery)}
                              </p>
                              <p className="text-xs text-red-500 font-semibold flex items-center gap-1 pt-1">
                                <Calendar size={14} /> Prazo: {dueDateFormatted}
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      {!isEditing && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(act)}
                            className="text-xs gap-1"
                          >
                            <Edit3 size={14} /> Editar
                          </Button>
                          <button
                            onClick={() => confirmDelete(act)}
                            className="p-2 rounded-xl border border-red-200 bg-white text-red-600 hover:bg-red-50 transition"
                            title="Excluir tarefa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Exibição de Subtarefas / Checklist */}
                    {act.subtasks && act.subtasks.length > 0 && (
                      <div className={`mt-2 p-3 rounded-lg border text-sm space-y-2 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
                        <span className="font-bold text-xs uppercase tracking-wider text-gray-400">Checklist da Atividade:</span>
                        <div className="space-y-1.5">
                          {act.subtasks.map((st) => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => toggleSubtask(act.id, st.id)}
                              className="flex items-center gap-2 text-left w-full hover:opacity-80 transition"
                            >
                              {st.completed ? (
                                <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                              ) : (
                                <Circle size={16} className="text-gray-400 shrink-0" />
                              )}
                              <span className={`text-sm ${st.completed ? "line-through text-gray-400" : ""}`}>{st.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Exibição de Anexos / Links de Referência */}
                    {act.attachments && act.attachments.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-xs font-bold text-gray-400 flex items-center gap-1"><Paperclip size={12} /> Anexos:</span>
                        {act.attachments.map((att) => (
                          <a
                            key={att.id}
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg border text-xs font-medium bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 transition inline-flex items-center gap-1"
                          >
                            <Link2 size={12} /> {att.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal de Confirmação de Exclusão */}
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
            <div className={`rounded-2xl max-w-md w-full p-6 space-y-6 shadow-xl border ${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"}`}>
              <div className="flex items-center gap-3 text-red-600">
                <AlertTriangle size={28} />
                <h3 className="text-lg font-bold">Confirmar Exclusão</h3>
              </div>
              <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                Tem certeza que deseja excluir a tarefa <b className="text-red-500">{activityToDelete?.title}</b>? Esta ação não pode ser desfeita.
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
