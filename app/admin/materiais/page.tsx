"use client";

import { useEffect, useState } from "react";
import { Trash2, Edit2, Plus, Download, ArrowLeft, Loader2, FileText, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Material {
  id: number;
  title: string;
  category: string;
  level: string;
  fileUrl: string | null;
  description?: string | null;
  createdAt: string;
}

export default function AdminMateriaisReal() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "Worksheets",
    level: "A1",
    fileUrl: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/materials");
      if (!res.ok) throw new Error("Falha ao carregar materiais");
      const data = await res.json();
      setMaterials(data.materials || data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category) {
      alert("Preencha título e categoria");
      return;
    }

    try {
      setSaving(true);
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `/api/admin/materials/${editingId}`
        : "/api/admin/materials";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...formData } : formData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Falha ao salvar material");
      }

      await fetchMaterials();
      setFormData({ title: "", category: "Worksheets", level: "A1", fileUrl: "", description: "" });
      setEditingId(null);
      setShowForm(false);
      alert("Material salvo com sucesso!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (material: Material) => {
    setFormData({
      title: material.title,
      category: material.category || "Worksheets",
      level: material.level || "A1",
      fileUrl: material.fileUrl || "",
      description: material.description || "",
    });
    setEditingId(material.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja realmente excluir este material?")) return;
    try {
      const res = await fetch(`/api/admin/materials/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Falha ao excluir material");
      setMaterials(materials.filter((m) => m.id !== id));
      alert("Material excluído com sucesso!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao excluir");
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
              <FileText className="text-blue-600" size={32} />
              Gerenciamento Completo de Materiais
            </h1>
            <p className="text-gray-600 mt-1">
              Adicione e organize recursos didáticos (Worksheets, Slides, Handouts, Áudios) classificados por nível CEFR.
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ title: "", category: "Worksheets", level: "A1", fileUrl: "", description: "" });
            }}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md shadow-blue-600/20"
          >
            <Plus size={20} />
            {showForm ? "Fechar Formulário" : "Novo Material Acadêmico"}
          </button>
        </div>

        {/* Formulário Completo de Material */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 transition-all animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText size={20} className="text-blue-600" />
              {editingId ? "Editar Material Acadêmico" : "Cadastrar Novo Material Acadêmico"}
            </h2>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Título do Material *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Worksheet - Simple Present & Routine"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Categoria Pedagógica *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition bg-white"
                  >
                    <option value="Worksheets">Worksheets (Atividades)</option>
                    <option value="Slides">Slides de Aula</option>
                    <option value="Handouts">Handouts & Resumos</option>
                    <option value="Audio">Áudio & Pronúncia</option>
                    <option value="Comics">Comics na Educação</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nível CEFR</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition bg-white"
                  >
                    <option value="A1">A1 - Iniciante</option>
                    <option value="A2">A2 - Básico</option>
                    <option value="B1">B1 - Intermediário</option>
                    <option value="B2">B2 - Intermediário Superior</option>
                    <option value="C1">C1 - Avançado</option>
                    <option value="C2">C2 - Profissional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Link do Arquivo (Google Drive / S3)</label>
                  <div className="relative">
                    <ExternalLink className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <input
                      type="url"
                      value={formData.fileUrl}
                      onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                      placeholder="https://drive.google.com/file/d/..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Instruções de Uso ou Descrição</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Instruções para o professor ou aluno sobre como utilizar este material em sala de aula ou estudo autônomo."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                />
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
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center gap-2 shadow-md shadow-blue-600/20 disabled:opacity-50"
                >
                  {saving && <Loader2 className="animate-spin" size={18} />}
                  {editingId ? "Salvar Alterações" : "Cadastrar Material"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Listagem de Materiais */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Biblioteca de Materiais</h2>
            <span className="text-sm text-gray-500 font-medium">{materials.length} itens cadastrados</span>
          </div>

          {loading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-blue-600" size={32} />
              <p className="text-gray-600 font-medium">Carregando materiais...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-600 font-medium">{error}</div>
          ) : materials.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <FileText size={48} className="mx-auto text-gray-300" />
              <p className="text-gray-600 font-medium">Nenhum material cadastrado ainda.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {materials.map((mat) => (
                <div key={mat.id} className="p-6 hover:bg-gray-50 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-100 text-blue-700">
                        {mat.category}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-gray-100 text-gray-700">
                        {mat.level}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{mat.title}</h3>
                    {mat.description && <p className="text-sm text-gray-600 line-clamp-2">{mat.description}</p>}
                  </div>

                  <div className="flex items-center gap-3">
                    {mat.fileUrl && (
                      <a
                        href={mat.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition flex items-center gap-1.5"
                      >
                        <Download size={14} /> Acessar Link
                      </a>
                    )}
                    <button
                      onClick={() => handleEdit(mat)}
                      className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition flex items-center gap-1.5"
                    >
                      <Edit2 size={14} /> Editar
                    </button>
                    <button
                      onClick={() => handleDelete(mat.id)}
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
