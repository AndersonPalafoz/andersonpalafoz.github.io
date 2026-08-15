"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Plus, Video, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Course {
  id: number;
  title: string;
  level: string;
}

interface Lesson {
  id: number;
  moduleId: number;
  title: string;
  description: string | null;
  videoUrl: string | null;
  duration: number | null;
  order: number;
  content: string | null;
  moduleTitle?: string;
}

export default function AdminAulasPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    moduleTitle: "Módulo 1: Fundamentos da Aula",
    title: "",
    description: "",
    videoUrl: "",
    duration: 15,
    order: 1,
    content: "",
  });

  useEffect(() => {
    async function loadCourses() {
      try {
        setLoadingCourses(true);
        const res = await fetch("/api/admin/courses");
        const data = await res.json();
        if (res.ok && Array.isArray(data) && data.length > 0) {
          setCourses(data);
          setSelectedCourseId(data[0].id);
        }
      } catch (err) {
        toast.error("Falha ao carregar cursos.");
      } finally {
        setLoadingCourses(false);
      }
    }
    void loadCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourseId) return;
    async function loadLessons() {
      try {
        setLoadingLessons(true);
        const res = await fetch(`/api/admin/lessons?courseId=${selectedCourseId}`);
        const data = await res.json();
        if (res.ok) {
          setLessons(data.lessons || []);
        }
      } catch (err) {
        toast.error("Falha ao carregar aulas.");
      } finally {
        setLoadingLessons(false);
      }
    }
    void loadLessons();
  }, [selectedCourseId]);

  const handleCreateLesson = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !formData.title) {
      toast.error("Selecione um curso e preencha o título da aula.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/admin/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourseId,
          ...formData,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao criar aula");

      toast.success("Aula criada com sucesso!");
      setLessons([...lessons, data.lesson]);
      setFormData({
        moduleTitle: "Módulo 1: Fundamentos da Aula",
        title: "",
        description: "",
        videoUrl: "",
        duration: 15,
        order: lessons.length + 1,
        content: "",
      });
      setShowForm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar aula");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <div>
            <Link href="/admin" className="text-sm font-semibold text-red-600 hover:underline flex items-center gap-1 mb-2">
              <ArrowLeft size={16} /> Voltar ao Painel Admin
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Video className="text-red-600" size={32} />
              Gerenciamento de Aulas por Curso
            </h1>
            <p className="text-gray-600 mt-1">
              Crie aulas estruturadas (ex: Curso de Inglês Básico → Aula 1), defina vídeos, materiais e objetivos pedagógicos.
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md shadow-red-600/20"
          >
            <Plus size={18} className="mr-2" />
            {showForm ? "Fechar Formulário" : "Nova Aula"}
          </Button>
        </header>

        {/* Seletor de Curso */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BookOpen className="text-red-600" size={24} />
            <span className="font-bold text-gray-900">Selecionar Curso:</span>
          </div>
          {loadingCourses ? (
            <Loader2 className="animate-spin text-red-600" size={24} />
          ) : (
            <select
              value={selectedCourseId || ""}
              onChange={(e) => setSelectedCourseId(Number(e.target.value))}
              className="px-4 py-3 rounded-xl border border-gray-300 font-medium bg-white focus:ring-2 focus:ring-red-600 outline-none min-w-[320px]"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.level})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Formulário de Criação de Aula */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Plus size={20} className="text-red-600" />
              Adicionar Nova Aula ao Curso
            </h2>

            <form onSubmit={handleCreateLesson} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Título do Módulo</label>
                  <input
                    type="text"
                    required
                    value={formData.moduleTitle}
                    onChange={(e) => setFormData({ ...formData, moduleTitle: e.target.value })}
                    placeholder="Ex: Módulo 1: Fundamentos & Engagement"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Título da Aula *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Aula 1: Apresentações e Cumprimentos"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">URL do Vídeo (YouTube)</label>
                  <input
                    type="text"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="Ex: https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-600 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Duração (min)</label>
                    <input
                      type="number"
                      min={1}
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ordem / Sequência</label>
                    <input
                      type="number"
                      min={1}
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-600 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Resumo e Objetivos da Aula</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Breve descrição dos objetivos pedagógicos e modelo ESA aplicável."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Conteúdo Detalhado (Markdown)</label>
                <textarea
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Vocabulário, gramática contextualizada e orientações de estudo..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-600 outline-none font-mono text-sm"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving} className="bg-red-600 text-white hover:bg-red-700">
                  {saving && <Loader2 className="animate-spin mr-2" size={16} />}
                  Salvar Aula
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Listagem de Aulas */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Aulas Cadastradas no Curso</h2>

          {loadingLessons ? (
            <div className="py-12 text-center flex items-center justify-center gap-3 text-gray-500">
              <Loader2 className="animate-spin text-red-600" size={24} /> Carregando aulas...
            </div>
          ) : lessons.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <Video className="mx-auto text-gray-300 mb-3" size={36} />
              <p className="font-semibold text-gray-800">Nenhuma aula cadastrada para este curso ainda.</p>
              <p className="text-sm text-gray-500 mt-1">Clique em "Nova Aula" para começar a estruturar o curso.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {lessons.map((lesson) => (
                <div key={lesson.id} className="p-5 rounded-xl border border-gray-200 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                        Aula #{lesson.order}
                      </span>
                      <h3 className="font-bold text-gray-900 text-lg">{lesson.title}</h3>
                    </div>
                    {lesson.description && <p className="text-sm text-gray-600">{lesson.description}</p>}
                    <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
                      <span className="flex items-center gap-1"><Clock size={14} /> {lesson.duration || 15} min</span>
                      {lesson.videoUrl && <span className="flex items-center gap-1 text-red-600 font-semibold"><Video size={14} /> Vídeo integrado</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/cursos`}>
                      <Button size="sm" variant="outline" className="text-gray-700">Gerenciar Curso</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
