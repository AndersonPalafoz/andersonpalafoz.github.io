"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, ArrowLeft, Loader2 } from "lucide-react";

interface Course {
  id: number;
  title: string;
  level: string;
  modules: number;
  description: string | null;
}

export default function AdminCursos() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: "", level: "", modules: 0, description: "" });

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
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao deletar curso");
    }
  };

  const handleEdit = (course: Course) => {
    setEditingId(course.id);
    setFormData({
      title: course.title,
      level: course.level,
      modules: course.modules,
      description: course.description || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      } else {
        const response = await fetch("/api/admin/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!response.ok) throw new Error("Falha ao criar curso");
        const [created] = await response.json();
        setCourses([...courses, created]);
      }
      setFormData({ title: "", level: "", modules: 0, description: "" });
      setShowForm(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao salvar curso");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciar Cursos</h1>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ title: "", level: "", modules: 0, description: "" });
            }}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus size={20} />
            Novo Curso
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingId ? "Editar Curso" : "Novo Curso"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nível</label>
                  <input
                    type="text"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Módulos</label>
                  <input
                    type="number"
                    value={formData.modules}
                    onChange={(e) => setFormData({ ...formData, modules: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  rows={3}
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {saving ? "Salvando..." : editingId ? "Atualizar" : "Criar"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 flex items-center justify-center text-gray-600 gap-2">
              <Loader2 className="animate-spin" size={20} />
              Carregando cursos...
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-600">Erro: {error}</div>
          ) : courses.length === 0 ? (
            <div className="p-12 text-center text-gray-600">Nenhum curso cadastrado ainda.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Título</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nível</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Módulos</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{course.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{course.level}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{course.modules}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(course)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
