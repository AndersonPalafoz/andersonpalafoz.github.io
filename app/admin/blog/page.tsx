
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, Plus, Eye } from "lucide-react";
import Link from "next/link";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  category: string | null;
  published: string | null;
  readingTime: number | null;
  createdAt: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    category: "",
    readingTime: 5,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/blog");

      if (!response.ok) {
        throw new Error("Falha ao carregar postagens");
      }

      const data = await response.json();
      setPosts(data.posts);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.slug || !formData.content) {
      alert("Preencha título, slug e conteúdo");
      return;
    }

    try {
      setSaving(true);
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `/api/admin/blog/${editingId}`
        : "/api/admin/blog";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Falha ao salvar postagem");
      }

      const data = await response.json();

      if (editingId) {
        setPosts(posts.map((p) => (p.id === editingId ? data.post : p)));
      } else {
        setPosts([...posts, data.post]);
      }

      setFormData({ title: "", slug: "", content: "", category: "", readingTime: 5 });
      setEditingId(null);
      setShowForm(false);
      alert("Postagem salva com sucesso!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao salvar postagem");
    } finally {
      setSaving(false);
    }
  };

  const handleEditPost = (post: BlogPost) => {
    setFormData({
      title: post.title,
      slug: post.slug,
      content: "",
      category: post.category || "",
      readingTime: post.readingTime || 5,
    });
    setEditingId(post.id);
    setShowForm(true);
  };

  const handleDeletePost = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar esta postagem?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/blog/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Falha ao deletar postagem");
      }

      setPosts(posts.filter((p) => p.id !== id));
      alert("Postagem deletada com sucesso!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao deletar postagem");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Gerenciamento de Blog
          </h1>
          <p className="text-gray-600">
            Crie, edite e publique postagens do seu blog
          </p>
        </div>

        {/* Botão Criar Postagem */}
        <div className="mb-6">
          <Button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ title: "", slug: "", content: "", category: "", readingTime: 5 });
            }}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Plus size={16} className="mr-2" />
            Nova Postagem
          </Button>
        </div>

        {/* Formulário de Criação/Edição */}
        {showForm && (
          <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingId ? "Editar Postagem" : "Criar Nova Postagem"}
            </h2>
            <form onSubmit={handleSavePost} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Título da postagem"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug (URL)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="titulo-da-postagem"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Gramática, Vocabulário, etc"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tempo de Leitura (minutos)
                  </label>
                  <input
                    type="number"
                    value={formData.readingTime}
                    onChange={(e) =>
                      setFormData({ ...formData, readingTime: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conteúdo (Markdown)
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono h-64"
                  placeholder="# Título\n\nSeu conteúdo em markdown..."
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {saving ? "Salvando..." : "Salvar Postagem"}
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

        {/* Tabela de Postagens */}
        <div className="overflow-hidden border border-gray-200 rounded-lg">
          {loading ? (
            <div className="p-8 text-center text-gray-600">
              Carregando postagens...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              Erro: {error}
            </div>
          ) : posts.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              Nenhuma postagem encontrada
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Título
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Criado em
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {post.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {post.category || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <Link href={`/blog/${post.slug}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Eye size={16} />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPost(post)}
                            className="text-yellow-600 hover:text-yellow-700"
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePost(post.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Link para voltar */}
        <div className="mt-8">
          <Link href="/admin">
            <Button variant="outline">Voltar para Admin</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
