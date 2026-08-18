"use client";

import { useEffect, useState } from "react";
import { Trash2, Edit2, Plus, ArrowLeft, Loader2, FileText, Clock, Tag } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  category: string | null;
  published: string | null;
  readingTime: number | null;
  content?: string | null;
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
    category: "Linguística & Ensino",
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
      setPosts(data.posts || data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (val: string) => {
    const slug = val
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setFormData((prev) => ({ ...prev, title: val, slug: editingId ? prev.slug : slug }));
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.slug || !formData.content) {
      toast.error("Preencha título, slug e conteúdo do artigo.");
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
        body: JSON.stringify(editingId ? { id: editingId, ...formData } : formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Falha ao salvar postagem");
      }

      const data = await response.json();
      const savedPost = data.post || data;

      if (editingId) {
        setPosts(posts.map((p) => (p.id === editingId ? savedPost : p)));
      } else {
        setPosts([...posts, savedPost]);
      }

      setFormData({ title: "", slug: "", content: "", category: "Linguística & Ensino", readingTime: 5 });
      setEditingId(null);
      setShowForm(false);
      toast.success("Artigo salvo com sucesso.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar postagem.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditPost = (post: BlogPost) => {
    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content || "",
      category: post.category || "Linguística & Ensino",
      readingTime: post.readingTime || 5,
    });
    setEditingId(post.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    <div className="min-h-screen bg-background py-12 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card text-card-foreground p-8 rounded-2xl shadow-sm border border-border">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/admin" className="text-sm font-semibold text-green-600 hover:underline flex items-center gap-1">
                <ArrowLeft size={16} /> Voltar ao Painel Admin
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <FileText className="text-green-600" size={32} />
              Gerenciamento Completo do Blog & Knowledge Hub
            </h1>
            <p className="text-muted-foreground mt-1">
              Publique artigos acadêmicos, ensaios sobre linguística e dicas de inglês formatados em Markdown.
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ title: "", slug: "", content: "", category: "Linguística & Ensino", readingTime: 5 });
            }}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md shadow-green-600/20"
          >
            <Plus size={20} />
            {showForm ? "Fechar Formulário" : "Novo Artigo Completo"}
          </button>
        </div>

        {/* Formulário Completo de Blog */}
        {showForm && (
          <div className="bg-card text-card-foreground rounded-2xl border border-border shadow-lg p-8 transition-all animate-fadeIn">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <FileText size={20} className="text-green-600" />
              {editingId ? "Editar Artigo" : "Criar Novo Artigo"}
            </h2>

            <form onSubmit={handleSavePost} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Título do Artigo *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Ex: Morfologia e Aquisição do Inglês para Brasileiros"
                    className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Slug (URL amigável) *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="morfologia-e-aquisicao-ingles"
                    className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition font-mono text-sm bg-background"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Categoria</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-3.5 text-muted-foreground" size={18} />
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Ex: Linguística Aplicada"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Tempo de Leitura (minutos)</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3.5 text-muted-foreground" size={18} />
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={formData.readingTime}
                      onChange={(e) => setFormData({ ...formData, readingTime: parseInt(e.target.value) || 5 })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Conteúdo do Artigo (Markdown) *</label>
                <textarea
                  rows={10}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Escreva seu artigo utilizando formatação Markdown (títulos ##, listas, negrito, etc.)..."
                  className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition font-mono text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-background transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold transition flex items-center gap-2 shadow-md shadow-green-600/20 disabled:opacity-50"
                >
                  {saving && <Loader2 className="animate-spin" size={18} />}
                  {editingId ? "Salvar Alterações" : "Publicar Artigo"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Listagem de Artigos */}
        <div className="bg-card text-card-foreground rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Artigos Publicados</h2>
            <span className="text-sm text-gray-500 font-medium">{posts.length} artigos no Knowledge Hub</span>
          </div>

          {loading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-green-600" size={32} />
              <p className="text-muted-foreground font-medium">Carregando artigos...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-600 font-medium">{error}</div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <FileText size={48} className="mx-auto text-gray-300" />
              <p className="text-muted-foreground font-medium">Nenhum artigo publicado ainda.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/70">
              {posts.map((post) => (
                <div key={post.id} className="p-6 hover:bg-background transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-green-100 text-green-700">
                        {post.category || "Geral"}
                      </span>
                      <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                        <Clock size={14} /> {post.readingTime || 5} min de leitura
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{post.title}</h3>
                    <p className="text-sm text-gray-500 font-mono">/{post.slug}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-foreground font-semibold text-xs transition flex items-center gap-1.5"
                    >
                      Ver Artigo
                    </Link>
                    <button
                      onClick={() => handleEditPost(post)}
                      className="px-4 py-2 rounded-xl bg-green-50 hover:bg-green-100 text-green-700 font-semibold text-xs transition flex items-center gap-1.5"
                    >
                      <Edit2 size={14} /> Editar
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
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
