"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  category: string | null;
  readingTime: number | null;
  published: string | null;
  createdAt: string;
}

export default function AdminArtigos() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "",
    readingTime: 5,
    content: "",
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/articles");
      if (!response.ok) throw new Error("Falha ao carregar artigos");
      const data = await response.json();
      setArticles(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este artigo?")) return;
    try {
      const response = await fetch(`/api/admin/articles?id=${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Falha ao deletar artigo");
      setArticles(articles.filter((a) => a.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao deletar artigo");
    }
  };

  const handleEdit = (article: Article) => {
    setEditingId(article.id);
    setFormData({
      title: article.title,
      slug: article.slug,
      category: article.category || "",
      readingTime: article.readingTime || 5,
      content: article.content || "",
    });
    setShowForm(true);
  };

  const handleTogglePublish = async (article: Article) => {
    try {
      const response = await fetch("/api/admin/articles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          article.published
            ? { id: article.id, published: null }
            : { id: article.id, action: "publish" }
        ),
      });
      if (!response.ok) throw new Error("Falha ao atualizar status de publicação");
      const [updated] = await response.json();
      setArticles(articles.map((a) => (a.id === article.id ? updated : a)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao publicar/despublicar artigo");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingId) {
        const response = await fetch("/api/admin/articles", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...formData }),
        });
        if (!response.ok) throw new Error("Falha ao atualizar artigo");
        const [updated] = await response.json();
        setArticles(articles.map((a) => (a.id === editingId ? updated : a)));
        setEditingId(null);
      } else {
        const response = await fetch("/api/admin/articles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!response.ok) throw new Error("Falha ao criar artigo");
        const [created] = await response.json();
        setArticles([...articles, created]);
      }
      setFormData({ title: "", slug: "", category: "", readingTime: 5, content: "" });
      setShowForm(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao salvar artigo");
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (published: string | null) =>
    published ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciar Artigos</h1>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ title: "", slug: "", category: "", readingTime: 5, content: "" });
            }}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={20} />
            Novo Artigo
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingId ? "Editar Artigo" : "Novo Artigo"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="titulo-do-artigo"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tempo de leitura (min)
                  </label>
                  <input
                    type="number"
                    value={formData.readingTime}
                    onChange={(e) =>
                      setFormData({ ...formData, readingTime: parseInt(e.target.value) || 5 })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                    min={1}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conteúdo (Markdown)
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  rows={8}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
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
              Carregando artigos...
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-600">Erro: {error}</div>
          ) : articles.length === 0 ? (
            <div className="p-12 text-center text-gray-600">Nenhum artigo cadastrado ainda.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Título</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Categoria</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{article.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{article.category || "-"}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(article.published)}`}>
                        {article.published ? "Publicado" : "Rascunho"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleTogglePublish(article)}
                          title={article.published ? "Despublicar" : "Publicar"}
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          {article.published ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <button
                          onClick={() => handleEdit(article)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(article.id)}
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
