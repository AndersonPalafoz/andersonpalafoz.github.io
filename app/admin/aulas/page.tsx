"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { BookOpen, Plus, Video, Clock, Loader2, Upload, FileText, Headphones, ChevronUp, ChevronDown, GripVertical, Target, ClipboardCheck, Pencil, X } from "lucide-react";
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
  audioUrl: string | null;
  duration: number | null;
  order: number;
  content: string | null;
  pedagogy?: {
    learningObjectives: string[];
    evidenceOfLearning: string[];
  };
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
  const [uploadingMaterial, setUploadingMaterial] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    moduleTitle: "Módulo 1: Fundamentos da Aula",
    title: "",
    description: "",
    videoUrl: "",
    audioUrl: "",
    duration: 15,
    order: 1,
    content: "",
    materialUrl: "",
    learningObjectives: "",
    evidenceOfLearning: "",
  });
  const [editingPedagogy, setEditingPedagogy] = useState<Lesson | null>(null);
  const [pedagogyDraft, setPedagogyDraft] = useState({ learningObjectives: "", evidenceOfLearning: "" });
  const [savingPedagogy, setSavingPedagogy] = useState(false);

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
        audioUrl: "",
        duration: 15,
        order: lessons.length + 1,
        content: "",
        materialUrl: "",
        learningObjectives: "",
        evidenceOfLearning: "",
      });
      setShowForm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar aula");
    } finally {
      setSaving(false);
    }
  };

  const moveLesson = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (!selectedCourseId || newIndex < 0 || newIndex >= lessons.length) return;
    const previous = lessons;
    const updated = [...lessons];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    const reindexed = updated.map((lesson, orderIndex) => ({ ...lesson, order: orderIndex + 1 }));
    setLessons(reindexed);

    try {
      toast.loading("Salvando nova ordem das aulas...", { id: "reorder-lesson" });
      const response = await fetch("/api/admin/lessons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: selectedCourseId, lessonIds: reindexed.map((lesson) => lesson.id) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao salvar ordem das aulas.");
      toast.success("Ordem das aulas alterada e salva com sucesso!", { id: "reorder-lesson" });
    } catch (error) {
      setLessons(previous);
      toast.error(error instanceof Error ? error.message : "Erro ao salvar ordem das aulas.", { id: "reorder-lesson" });
    }
  };

  const openPedagogyEditor = (lesson: Lesson) => {
    setEditingPedagogy(lesson);
    setPedagogyDraft({
      learningObjectives: lesson.pedagogy?.learningObjectives.join("\n") || "",
      evidenceOfLearning: lesson.pedagogy?.evidenceOfLearning.join("\n") || "",
    });
  };

  const savePedagogy = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedCourseId || !editingPedagogy) return;
    setSavingPedagogy(true);
    try {
      const response = await fetch("/api/admin/lessons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourseId,
          lessonId: editingPedagogy.id,
          learningObjectives: pedagogyDraft.learningObjectives,
          evidenceOfLearning: pedagogyDraft.evidenceOfLearning,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível salvar a proposta pedagógica.");
      setLessons((current) => current.map((lesson) => lesson.id === editingPedagogy.id ? data.lesson : lesson));
      setEditingPedagogy(null);
      toast.success("Objetivos e evidências atualizados para esta aula.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar a proposta pedagógica.");
    } finally {
      setSavingPedagogy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900/50 py-12 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Breadcrumbs Hierárquicos */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
          <Link href="/admin" className="hover:text-red-600 font-medium">Painel Admin</Link>
          <span>/</span>
          <Link href="/admin/cursos" className="hover:text-red-600 font-medium">Cursos</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-bold">Gerenciamento de Aulas & Materiais</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <BookOpen className="text-red-600" size={32} />
              Construtor de Aulas & Materiais de Apoio
            </h1>
            <p className="text-gray-600 dark:text-slate-400 mt-1">
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
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 dark:text-slate-400 mb-1">Selecionar Curso Ativo</label>
            {loadingCourses ? (
              <p className="text-sm text-gray-500 dark:text-slate-400">Carregando cursos...</p>
            ) : (
              <select
                value={selectedCourseId || ""}
                onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                className="w-full md:w-80 h-11 px-4 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium text-gray-900 dark:text-white outline-none focus:border-red-600 transition"
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-lg p-8 space-y-6 animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen size={20} className="text-red-600" />
              Cadastrar Nova Aula & Material de Apoio
            </h2>

            <form onSubmit={handleCreateLesson} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Título do Módulo *</label>
                  <input
                    type="text"
                    required
                    value={formData.moduleTitle}
                    onChange={(e) => setFormData({ ...formData, moduleTitle: e.target.value })}
                    placeholder="Ex: Módulo 1: Introdução ao Simple Present"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 outline-none focus:border-red-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Título da Aula *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Aula 1: Rotinas Diárias e Afirmativas"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 outline-none focus:border-red-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">URL do Vídeo (YouTube / Vídeo Aula)</label>
                  <div className="relative">
                    <Video className="absolute left-3 top-3.5 text-gray-400 dark:text-slate-500" size={18} />
                    <input
                      type="text"
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 outline-none focus:border-red-600 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">URL do Áudio de Listening</label>
                  <div className="relative flex gap-2">
                    <Headphones className="absolute left-3 top-3.5 text-gray-400 dark:text-slate-500" size={18} />
                    <input
                      type="url"
                      value={formData.audioUrl}
                      onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                      placeholder="https://.../listening.mp3"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 outline-none focus:border-red-600 transition"
                    />
                    <label className="cursor-pointer shrink-0 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-700 dark:text-slate-300 px-4 py-3 rounded-xl font-semibold text-sm transition flex items-center gap-2">
                      <Upload size={16} />
                      <span>Enviar</span>
                      <input
                        type="file"
                        accept="audio/webm,audio/ogg,audio/mpeg,audio/wav,audio/mp4"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          e.currentTarget.value = "";
                          if (!file) return;
                          try {
                            const payload = new FormData();
                            payload.append("file", file);
                            payload.append("context", "lesson-audio");
                            const response = await fetch("/api/upload", { method: "POST", body: payload });
                            const result = await response.json();
                            if (!response.ok) throw new Error(result.error || "Falha ao enviar áudio");
                            setFormData((current) => ({ ...current, audioUrl: result.url }));
                            toast.success(`Áudio ${file.name} enviado e vinculado ao formulário.`);
                          } catch (error) {
                            toast.error(error instanceof Error ? error.message : "Erro ao enviar áudio.");
                          }
                        }}
                      />
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">Aceita MP3, WAV, OGG, WebM ou MP4, com limite de 15 MB.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Duração (minutos)</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3.5 text-gray-400 dark:text-slate-500" size={18} />
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 outline-none focus:border-red-600 transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Material de Apoio (PDF / Worksheet / Exercício)</label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <FileText className="absolute left-3 top-3.5 text-gray-400 dark:text-slate-500" size={18} />
                    <input
                      type="text"
                      value={formData.materialUrl}
                      onChange={(e) => setFormData({ ...formData, materialUrl: e.target.value })}
                      placeholder="URL do PDF ou anexo (ex: /materiais/everyday-vocabulary-b1.pdf)"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 outline-none focus:border-red-600 transition bg-white dark:bg-slate-900"
                    />
                  </div>
                  <label className="cursor-pointer bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-700 dark:text-slate-300 px-5 py-3 rounded-xl font-semibold text-sm transition flex items-center gap-2">
                    <Upload size={18} />
                    <span>{uploadingMaterial ? "Carregando..." : "Carregar Arquivo"}</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.zip,.mp3"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        e.currentTarget.value = "";
                        if (!file) return;
                        try {
                          setUploadingMaterial(true);
                          const payload = new FormData();
                          payload.append("file", file);
                          payload.append("context", "lesson-material");
                          const response = await fetch("/api/upload", { method: "POST", body: payload });
                          const result = await response.json();
                          if (!response.ok) throw new Error(result.error || "Falha ao carregar o material");
                          setFormData((current) => ({ ...current, materialUrl: result.url }));
                          toast.success(`Arquivo ${file.name} carregado e pronto para vinculação.`);
                        } catch (error) {
                          toast.error(error instanceof Error ? error.message : "Erro ao carregar material.");
                        } finally {
                          setUploadingMaterial(false);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Resumo ou Roteiro da Aula</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Breve descrição dos tópicos abordados nesta aula..."
                  className="w-full p-4 rounded-xl border border-gray-300 dark:border-slate-700 outline-none focus:border-red-600 transition resize-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 rounded-2xl border border-red-100 bg-red-50/50 p-5 md:grid-cols-2 dark:border-red-900/50 dark:bg-red-950/15">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-slate-300"><Target size={16} className="text-red-600" /> Objetivos de aprendizagem</label>
                  <textarea
                    rows={4}
                    value={formData.learningObjectives}
                    onChange={(e) => setFormData({ ...formData, learningObjectives: e.target.value })}
                    placeholder={"Um objetivo por linha.\nEx.: Usar o Simple Present para descrever rotinas."}
                    className="w-full resize-none rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-red-600 dark:border-slate-700 dark:bg-slate-900"
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">Declare o que o estudante deverá compreender ou conseguir fazer ao final da aula.</p>
                </div>
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-slate-300"><ClipboardCheck size={16} className="text-red-600" /> Evidências de aprendizagem</label>
                  <textarea
                    rows={4}
                    value={formData.evidenceOfLearning}
                    onChange={(e) => setFormData({ ...formData, evidenceOfLearning: e.target.value })}
                    placeholder={"Uma evidência por linha.\nEx.: Produzir três frases contextualizadas sobre a própria rotina."}
                    className="w-full resize-none rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-red-600 dark:border-slate-700 dark:bg-slate-900"
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">Indique produções ou desempenhos observáveis que demonstram a aprendizagem.</p>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 rounded-xl border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-semibold hover:bg-gray-50 transition"
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Aulas Cadastradas no Curso ({lessons.length})</h2>
            <span className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase">Hierarquia Ativa</span>
          </div>

          {loadingLessons ? (
            <div className="p-12 text-center text-gray-500 dark:text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="animate-spin text-red-600" size={24} />
              <span>Carregando aulas...</span>
            </div>
          ) : lessons.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <BookOpen size={48} className="mx-auto text-gray-300 dark:text-slate-600" />
              <p className="text-gray-600 dark:text-slate-400 font-medium">Nenhuma aula cadastrada para este curso ainda.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {lessons.map((lesson, index) => (
                <div key={lesson.id} className="flex flex-col justify-between gap-4 p-6 transition hover:bg-gray-50 dark:hover:bg-slate-800/60 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-4">
                    <div className="cursor-grab text-gray-400 dark:text-slate-500">
                      <GripVertical size={20} />
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 font-bold flex items-center justify-center text-sm">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
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
                      <h3 className="font-bold text-gray-900 dark:text-white mt-1">{lesson.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{lesson.description || "Sem descrição informada."}</p>
                      {(lesson.pedagogy?.learningObjectives.length || lesson.pedagogy?.evidenceOfLearning.length) ? (
                        <div className="mt-3 grid gap-2 text-xs text-gray-600 dark:text-slate-300 sm:grid-cols-2">
                          {lesson.pedagogy.learningObjectives.length > 0 && <p className="flex items-start gap-1.5"><Target size={14} className="mt-0.5 shrink-0 text-red-600" /><span><strong>Objetivos:</strong> {lesson.pedagogy.learningObjectives.length}</span></p>}
                          {lesson.pedagogy.evidenceOfLearning.length > 0 && <p className="flex items-start gap-1.5"><ClipboardCheck size={14} className="mt-0.5 shrink-0 text-red-600" /><span><strong>Evidências:</strong> {lesson.pedagogy.evidenceOfLearning.length}</span></p>}
                        </div>
                      ) : <p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-300">Objetivos e evidências ainda não declarados.</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => openPedagogyEditor(lesson)}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-700 transition hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200"
                      aria-label={`Editar objetivos e evidências da aula ${lesson.title}`}
                    >
                      <Pencil size={14} /> Proposta pedagógica
                    </button>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveLesson(index, "up")}
                        disabled={index === 0}
                        className="p-1 rounded bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 disabled:opacity-30 transition"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => moveLesson(index, "down")}
                        disabled={index === lessons.length - 1}
                        className="p-1 rounded bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 disabled:opacity-30 transition"
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

        {editingPedagogy && (
          <form onSubmit={savePedagogy} className="rounded-2xl border border-red-200 bg-white p-6 shadow-lg dark:border-red-900/60 dark:bg-slate-900" aria-labelledby="pedagogy-editor-title">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-red-600">Proposta pedagógica da aula</p>
                <h2 id="pedagogy-editor-title" className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{editingPedagogy.title}</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">A atualização preserva o roteiro e os materiais já associados.</p>
              </div>
              <button type="button" onClick={() => setEditingPedagogy(null)} disabled={savingPedagogy} className="inline-flex min-h-10 items-center justify-center gap-1.5 self-start rounded-xl border border-gray-300 px-3 text-xs font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"><X size={15} /> Fechar</button>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">Objetivos de aprendizagem<textarea rows={5} value={pedagogyDraft.learningObjectives} onChange={(event) => setPedagogyDraft((current) => ({ ...current, learningObjectives: event.target.value }))} className="mt-2 w-full resize-none rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-red-600 dark:border-slate-700 dark:bg-slate-950" /></label>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">Evidências de aprendizagem<textarea rows={5} value={pedagogyDraft.evidenceOfLearning} onChange={(event) => setPedagogyDraft((current) => ({ ...current, evidenceOfLearning: event.target.value }))} className="mt-2 w-full resize-none rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-red-600 dark:border-slate-700 dark:bg-slate-950" /></label>
            </div>
            <div className="mt-5 flex flex-wrap justify-end gap-3"><button type="button" onClick={() => setEditingPedagogy(null)} disabled={savingPedagogy} className="min-h-11 rounded-xl border border-gray-300 px-4 text-sm font-bold text-gray-700 dark:border-slate-700 dark:text-slate-200">Cancelar</button><button type="submit" disabled={savingPedagogy} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60">{savingPedagogy && <Loader2 size={16} className="animate-spin" />} Salvar proposta</button></div>
          </form>
        )}
      </div>
    </div>
  );
}
