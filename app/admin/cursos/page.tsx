"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, ArrowLeft, Loader2, BookOpen, Layers, User, FileText } from "lucide-react";

interface Course {
  id: number;
  title: string;
  level: string;
  modules: number;
  instructor?: string | null;
  description: string | null;
}

export default function AdminCursos() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    level: "A1",
    modules: 4,
    instructor: "Anderson Palafoz",
    modality: "individual" as "individual" | "group",
    isFree: true,
    price: 0,
    description: "",
    imageUrl: "",
    audioUrl: "",
    videoUrl: "",
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/courses");
      if (!response.ok) throw new Error("Falha ao carregar cursos");
      const data = await response.json();
      setCourses(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este curso?")) return;
    try {
      const response = await fetch(`/api/admin/courses?id=${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Falha ao deletar curso");
      setCourses(courses.filter((c) => c.id !== id));
      alert("Curso deletado com sucesso!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao deletar curso");
    }
  };

  const handleEdit = (course: any) => {
    setEditingId(course.id);
    setFormData({
      title: course.title,
      level: course.level || "A1",
      modules: course.modules || 1,
      instructor: course.instructor || "Anderson Palafoz",
      modality: course.modality || "individual",
      isFree: course.isFree ?? true,
      price: course.price ?? 0,
      description: course.description || "",
      imageUrl: course.imageUrl || "",
      audioUrl: course.audioUrl || "",
      videoUrl: course.videoUrl || "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.level) {
      alert("Preencha o título e o nível CEFR do curso.");
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        const response = await fetch("/api/admin/courses", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...formData }),
        });
        if (!response.ok) throw new Error("Falha ao atualizar curso");
        const [updated] = await response.json();
        setCourses(courses.map((c) => (c.id === editingId ? updated : c)));
        setEditingId(null);
        alert("Curso atualizado com sucesso!");
        setShowForm(false);
        setFormData({ title: "", level: "A1", modules: 4, instructor: "Anderson Palafoz", modality: "individual", isFree: true, price: 0, description: "", imageUrl: "", audioUrl: "", videoUrl: "" });
      } else {
        const response = await fetch("/api/admin/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!response.ok) throw new Error("Falha ao criar curso");
        const [created] = await response.json();
        const newCourseId = created.id;
        setCourses([...courses, created]);
        alert("Curso criado com sucesso! Redirecionando para estruturar os módulos...");
        window.location.href = `/admin/cursos/${newCourseId}/modulos`;
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao salvar curso");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/admin" className="text-sm font-semibold text-red-600 hover:underline flex items-center gap-1">
                <ArrowLeft size={16} /> Voltar ao Painel Admin
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BookOpen className="text-red-600" size={32} />
              Gerenciamento Completo de Cursos
            </h1>
            <p className="text-gray-600 mt-1">
              Crie, edite e estruture cursos de inglês com níveis CEFR (A1-C2), módulos e ementa detalhada.
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ title: "", level: "A1", modules: 4, instructor: "Anderson Palafoz", modality: "individual", isFree: true, price: 0, description: "", imageUrl: "", audioUrl: "", videoUrl: "" });
            }}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md shadow-red-600/20"
          >
            <Plus size={20} />
            {showForm ? "Fechar Formulário" : "Novo Curso Completo"}
          </button>
        </div>

        {/* Formulário Completo de Curso */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 transition-all animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BookOpen size={20} className="text-red-600" />
              {editingId ? "Editar Curso" : "Cadastrar Novo Curso & Estruturar Módulos"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Título do Curso *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Inglês Instrumental para Iniciantes (A1)"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nível CEFR *</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition bg-white"
                  >
                    <option value="A1">A1 - Iniciante / Beginner</option>
                    <option value="A2">A2 - Básico / Elementary</option>
                    <option value="B1">B1 - Intermediário / Intermediate</option>
                    <option value="B2">B2 - Intermediário Superior / Upper-Intermediate</option>
                    <option value="C1">C1 - Avançado / Advanced</option>
                    <option value="C2">C2 - Profissional / Mastery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quantidade Inicial de Módulos</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={formData.modules}
                    onChange={(e) => setFormData({ ...formData, modules: parseInt(e.target.value) || 4 })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">Ao salvar, você será direcionado para gerenciar os módulos e aulas deste curso.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Professor Responsável</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={formData.instructor}
                      onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                      placeholder="Ex: Anderson Palafoz"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Modelo de Acesso / Precificação</label>
                  <select
                    value={formData.isFree ? "free" : "paid"}
                    onChange={(e) => setFormData({ ...formData, isFree: e.target.value === "free" })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition bg-white font-medium text-gray-900"
                  >
                    <option value="free">Gratuito (Acesso Livre para Alunos)</option>
                    <option value="paid">Pago (Requer Assinatura / Pagamento Stripe)</option>
                  </select>
                </div>

                {!formData.isFree && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Preço do Curso (R$)</label>
                    <input
                      type="number"
                      min={1}
                      step={0.01}
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      placeholder="Ex: 149.90"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">URL do Vídeo / Áudio Introdutório</label>
                  <input
                    type="text"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="YouTube URL ou link de áudio"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição Detalhada e Ementa</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva os objetivos pedagógicos, gramática abordada, vocabulário e metodologia (ex: modelo ESA)."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
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
                  {editingId ? "Salvar Alterações" : "Criar Curso & Ir para Módulos →"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Listagem de Cursos */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Cursos Disponíveis</h2>
            <span className="text-sm text-gray-500 font-medium">{courses.length} cursos cadastrados</span>
          </div>

          {loading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-red-600" size={32} />
              <p className="text-gray-600 font-medium">Carregando cursos...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-600 font-medium">{error}</div>
          ) : courses.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <BookOpen size={48} className="mx-auto text-gray-300" />
              <p className="text-gray-600 font-medium">Nenhum curso cadastrado ainda.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {courses.map((course) => (
                <div key={course.id} className="p-6 hover:bg-gray-50 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-red-100 text-red-600">
                        Nível {course.level}
                      </span>
                      <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                        <Layers size={14} /> {course.modules} Módulos
                      </span>
                      {course.instructor && (
                        <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                          <User size={14} /> {course.instructor}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{course.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{course.description || "Sem descrição informada."}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link href={`/admin/cursos/${course.id}/modulos`}>
                      <button className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition flex items-center gap-1.5">
                        <Layers size={14} /> Gerenciar Módulos
                      </button>
                    </Link>
                    <button
                      onClick={() => handleEdit(course)}
                      className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition flex items-center gap-1.5"
                    >
                      <Edit2 size={14} /> Editar
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs transition flex items-center gap-1.5"
                    >
                      <Trash2 size={14} /> Excluir
                    </button>
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
