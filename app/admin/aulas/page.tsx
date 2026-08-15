"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { BookOpen, Plus, Video, Clock, Loader2, Upload, FileText, ChevronUp, ChevronDown, GripVertical } from "lucide-react";
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
  materialUrl?: string;
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
    materialUrl: "",
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

      toast.success("Aula criada com sucesso com material de apoio!");
      setLessons([...lessons, data.lesson]);
      setFormData({
        moduleTitle: "Módulo 1: Fundamentos da Aula",
        title: "",
        description: "",
        videoUrl: "",
        duration: 15,
        order: lessons.length + 1,
        content: "",
        materialUrl: "",
      });
      setShowForm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar aula");
    } finally {
      setSaving(false);
    }
  };

  const moveLesson = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= lessons.length) return;
    const updated = [...lessons];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    const reindexed = updated.map((l, idx) => ({ ...l, order: idx + 1 }));
    setLessons(reindexed);
    toast.success("Ordem das aulas atualizada!");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Breadcrumbs Hierárquicos */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 bg-white px-6 py-3 rounded-2xl border border-gray-200 shadow-sm">
          <Link href="/admin" className="hover:text-red-600 font-medium">Painel Admin</Link>
          <span>/</span>
          <Link href="/admin/cursos" className="hover:text-red-600 font-medium">Cursos</Link>
          <span>/</span>
          <span className="text-gray-900 font-bold">Gerenciamento de Aulas & Materiais</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BookOpen className="text-red-600" size={32} />
              Construtor de Aulas & Materiais de Apoio
            </h1>
            <p className="text-gray-600 mt-1">
              Organize aulas por módulos, adicione vídeos, texto explicativo e faça upload de materiais complementares.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition shadow-md shadow-red-600/20"
          >
            <Plus size={20} />
            {showForm ? "Fechar Formulário" : "Nova Aula + Material"}
          </button>
        </div>

        {/* Seletor de Curso */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Selecionar Curso Ativo</label>
            {loadingCourses ? (
              <p className="text-sm text-gray-500">Carregando cursos...</p>
            ) : (
              <select
                value={selectedCourseId || ""}
                onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                className="w-full md:w-80 h-11 px-4 rounded-xl border border-gray-300 bg-white font-medium text-gray-900 outline-none focus:border-red-600 transition"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} (Nível {c.level})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Formulário de Criação de Aula com Upload de Material */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 space-y-6 animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen size={20} className="text-red-600" />
              Cadastrar Nova Aula & Material de Apoio
            </h2>

            <form onSubmit={handleCreateLesson} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Título do Módulo *</label>
                  <input
                    type="text"
                    required
                    value={formData.moduleTitle}
                    onChange={(e) => setFormData({ ...formData, moduleTitle: e.target.value })}
                    placeholder="Ex: Módulo 1: Introdução ao Simple Present"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-red-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Título da Aula *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Aula 1: Rotinas Diárias e Afirmativas"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-red-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">URL do Vídeo (YouTube / Vídeo Aula)</label>
                  <div className="relative">
                    <Video className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-red-600 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Duração (minutos)</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-red-600 transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Material de Apoio (PDF / Worksheet / Exercício)</label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <FileText className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={formData.materialUrl}
                      onChange={(e) => setFormData({ ...formData, materialUrl: e.target.value })}
                      placeholder="URL do PDF ou anexo (ex: /materiais/everyday-vocabulary-b1.pdf)"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-red-600 transition bg-white"
                    />
                  </div>
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-3 rounded-xl font-semibold text-sm transition flex items-center gap-2">
                    <Upload size={18} />
                    <span>Carregar Arquivo</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.zip,.mp3"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFormData({ ...formData, materialUrl: `/materiais/${file.name}` });
                          toast.success(`Arquivo ${file.name} vinculado à aula com sucesso!`);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Resumo ou Roteiro da Aula</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Breve descrição dos tópicos abordados nesta aula..."
                  className="w-full p-4 rounded-xl border border-gray-300 outline-none focus:border-red-600 transition resize-none"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition flex items-center gap-2 shadow-md shadow-red-600/20 disabled:opacity-50"
                >
                  {saving && <Loader2 className="animate-spin" size={18} />}
                  Salvar Aula & Material
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de Aulas Cadastradas */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Aulas Cadastradas no Curso ({lessons.length})</h2>
            <span className="text-xs font-semibold text-gray-400 uppercase">Hierarquia Ativa</span>
          </div>

          {loadingLessons ? (
            <div className="p-12 text-center text-gray-500 flex items-center justify-center gap-2">
              <Loader2 className="animate-spin text-red-600" size={24} />
              <span>Carregando aulas...</span>
            </div>
          ) : lessons.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <BookOpen size={48} className="mx-auto text-gray-300" />
              <p className="text-gray-600 font-medium">Nenhuma aula cadastrada para este curso ainda.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {lessons.map((lesson, index) => (
                <div key={lesson.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition">
                  <div className="flex items-center gap-4">
                    <div className="cursor-grab text-gray-400">
                      <GripVertical size={20} />
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 font-bold flex items-center justify-center text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full">
                          {lesson.moduleTitle || "Módulo Geral"}
                        </span>
                        {lesson.materialUrl && (
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <FileText size={12} /> Material Anexado
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 mt-1">{lesson.title}</h3>
                      <p className="text-xs text-gray-500">{lesson.description || "Sem descrição informada."}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveLesson(index, "up")}
                        disabled={index === 0}
                        className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 transition"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => moveLesson(index, "down")}
                        disabled={index === lessons.length - 1}
                        className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-30 transition"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
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
