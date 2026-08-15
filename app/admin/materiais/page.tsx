"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, Plus, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Material {
  id: number;
  title: string;
  category: string;
  level: string;
  fileUrl: string | null;
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
      description: "",
    });
    setEditingId(material.id);
    setShowForm(true);
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
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Materiais</h1>
              <p className="text-gray-600">Crie, edite e gerencie materiais didáticos conectados ao banco</p>
            </div>
          </div>
          <Button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ title: "", category: "Worksheets", level: "A1", fileUrl: "", description: "" });
            }}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Plus size={16} className="mr-2" />
            Novo Material
          </Button>
        </div>

        {showForm && (
          <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              {editingId ? "Editar Material" : "Novo Material"}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nível CEFR</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                    <option value="C2">C2</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL do Arquivo (PDF/Áudio)</label>
                <input
                  type="text"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="https://..."
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving} className="bg-red-600 hover:bg-red-700 text-white">
                  {saving ? "Salvando..." : "Salvar Material"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Carregando materiais...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">Erro: {error}</div>
          ) : materials.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Nenhum material encontrado no banco.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Título</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Categoria</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nível</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {materials.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{m.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{m.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{m.level}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        {m.fileUrl && (
                          <a href={m.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 p-1">
                            <Download size={16} />
                          </a>
                        )}
                        <button onClick={() => handleEdit(m)} className="text-yellow-600 hover:text-yellow-800 p-1">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(m.id)} className="text-red-600 hover:text-red-800 p-1">
                          <Trash2 size={16} />
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
