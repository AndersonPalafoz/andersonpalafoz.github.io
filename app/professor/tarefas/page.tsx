"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, CheckSquare, Calendar, MessageCircle, Plus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { buildWhatsAppMessageLink, buildDeadlineReminderText } from "@/lib/notifications-helper";

interface Activity {
  id: number;
  title: string;
  description: string | null;
  type: string;
  dueDate: string | null;
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
              Monitore prazos de entrega, crie novas tarefas com feedback animado e envie lembretes automáticos via WhatsApp.
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-red-600 hover:bg-red-700 text-white font-semibold">
            <Plus size={18} className="mr-2" /> Nova Tarefa / Deadline
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleCreateActivity} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Cadastrar Nova Tarefa</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
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

        {/* Lista de Atividades e Prazos */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Atividades Cadastradas e Prazos</h2>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-red-600" size={32} /></div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <CheckSquare className="mx-auto text-gray-300 mb-3" size={36} />
              <p className="font-semibold text-gray-800">Nenhuma tarefa pendente no feed global.</p>
              <p className="text-sm mt-1">Utilize o botão acima para cadastrar novas tarefas e prazos para os alunos.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
