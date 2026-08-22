'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { Clock, MessageSquare, PlusCircle, Search, Tag, ThumbsUp } from "lucide-react";

type ForumPost = {
  id: number;
  title: string;
  author: string;
  category: string;
  content: string;
  audioUrl: string | null;
  likes: number;
  replies: number;
  createdAt: string;
  status: "approved" | "resolved";
};

const fallbackCategories = ["Todos", "Gramática", "Pronúncia", "Dicas", "Vocabulário"];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function ForumPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Gramática");
  const [newContent, setNewContent] = useState("");
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [categories, setCategories] = useState(fallbackCategories);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [likingId, setLikingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set("search", searchTerm.trim());
      if (selectedCategory !== "Todos") params.set("category", selectedCategory);
      const response = await fetch(`/api/forum?${params.toString()}`, { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Não foi possível carregar o fórum.");
      setPosts(body.posts || []);
      if (Array.isArray(body.categories) && body.categories.length) setCategories(["Todos", ...body.categories]);
    } catch (cause) {
      setPosts([]);
      setError(cause instanceof Error ? cause.message : "Não foi possível carregar os tópicos persistidos.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    const timer = window.setTimeout(loadPosts, 180);
    return () => window.clearTimeout(timer);
  }, [loadPosts]);

  const visiblePosts = useMemo(() => posts, [posts]);

  async function handleLike(postId: number) {
    // Atualização otimista imediata para feedback instantâneo (Optimistic UI)
    const previousPosts = posts;
    setPosts((current) =>
      current.map((post) => (post.id === postId ? { ...post, likes: post.likes + 1 } : post))
    );
    try {
      setLikingId(postId);
      const response = await fetch(`/api/forum/${postId}/like`, { method: "POST" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Não foi possível atualizar a curtida.");
      setPosts((current) =>
        current.map((post) => (post.id === postId ? { ...post, likes: body.likes } : post))
      );
    } catch (cause) {
      // Rollback em caso de falha de rede ou validação
      setPosts(previousPosts);
      setError(cause instanceof Error ? cause.message : "Não foi possível atualizar a curtida.");
    } finally {
      setLikingId(null);
    }
  }

  async function handleCreatePost(event: React.FormEvent) {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      const response = await fetch("/api/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, category: newCategory, content: newContent }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Não foi possível publicar o tópico.");
      setNewTitle("");
      setNewContent("");
      setIsModalOpen(false);
      setNotice("Tópico enviado para moderação. Ele aparecerá publicamente após aprovação.");
      await loadPosts();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível publicar o tópico.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-container py-8 sm:py-10 space-y-8">
      <div className="bg-gradient-to-r from-red-600 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/20 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider"><MessageSquare size={15} /> Comunidade Acadêmica</div>
          <h1 className="text-3xl font-black tracking-tight">Fórum de Discussão e Prática</h1>
          <p className="text-white/90 text-sm max-w-xl leading-relaxed">Tire dúvidas e compartilhe dicas. Tópicos enviados passam por moderação antes de serem publicados.</p>
        </div>
        <button type="button" onClick={() => setIsModalOpen(true)} className="bg-white text-red-600 hover:bg-slate-100 font-black text-xs px-6 py-3.5 rounded-2xl shadow-lg transition flex items-center gap-2 shrink-0"><PlusCircle size={17} /> Nova Discussão</button>
      </div>

      {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800">{notice}</div>}
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-800">{error}</div>}

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <label className="relative w-full md:w-96">
          <span className="sr-only">Buscar tópicos</span>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="search" placeholder="Buscar dúvidas, termos ou dicas..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="w-full bg-background border border-border rounded-2xl pl-10 pr-4 py-3 text-xs font-bold text-foreground focus:outline-red-600" />
        </label>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto min-w-0 pb-2 md:pb-0">
          {categories.map((category) => <button key={category} type="button" onClick={() => setSelectedCategory(category)} className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${selectedCategory === category ? "bg-red-600 text-white" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>{category}</button>)}
        </div>
      </div>

      {loading ? (
        <div className="surface-card p-12 text-center text-sm text-muted-foreground">Carregando tópicos persistidos…</div>
      ) : visiblePosts.length === 0 ? (
        <div className="surface-card p-12 text-center space-y-2"><p className="text-sm font-bold text-foreground">Nenhum tópico publicado ainda.</p><p className="text-xs text-muted-foreground">Se você tem uma dúvida, publique uma nova discussão. Ela será analisada pela moderação.</p></div>
      ) : (
        <div className="grid gap-4">
          {visiblePosts.map((post) => (
            <article key={post.id} className="surface-card p-6 space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div><p className="text-xs font-bold text-foreground">{post.author}</p><p className="text-[10px] text-muted-foreground">{formatDate(post.createdAt)}</p></div>
                <div className="flex items-center gap-2"><span className="rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 text-[10px] font-bold flex items-center gap-1"><Clock size={11} /> {post.status === "resolved" ? "Resolvido" : "Publicado"}</span><span className="rounded-full bg-red-50 text-red-600 border border-red-200 px-3 py-1 text-[10px] font-bold flex items-center gap-1.5"><Tag size={12} /> {post.category}</span></div>
              </div>
              <h2 className="text-base font-black text-foreground">{post.title}</h2>
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{post.content}</p>
              {post.audioUrl && <audio controls preload="none" src={post.audioUrl} className="w-full" aria-label={`Áudio do tópico ${post.title}`} />}
              <div className="flex items-center gap-6 pt-2 border-t border-border text-xs font-bold text-muted-foreground"><button type="button" disabled={likingId === post.id} onClick={() => handleLike(post.id)} className="flex items-center gap-1.5 hover:text-red-600 disabled:opacity-60"><ThumbsUp size={15} /> {post.likes} Curtidas</button><span className="flex items-center gap-1.5"><MessageSquare size={15} /> {post.replies} Respostas</span></div>
            </article>
          ))}
        </div>
      )}

      {isModalOpen && <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4"><div className="bg-background border border-border rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6"><div className="flex items-center justify-between border-b border-border pb-4"><h3 className="text-lg font-black text-foreground">Nova Discussão ou Dúvida</h3><button type="button" onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">Fechar</button></div><form onSubmit={handleCreatePost} className="space-y-4"><input type="text" required minLength={3} maxLength={200} placeholder="Título da dúvida ou dica" value={newTitle} onChange={(event) => setNewTitle(event.target.value)} className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm font-bold text-foreground" /><select value={newCategory} onChange={(event) => setNewCategory(event.target.value)} className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm font-bold text-foreground">{categories.filter((category) => category !== "Todos").map((category) => <option key={category} value={category}>{category}</option>)}</select><textarea rows={5} required minLength={3} maxLength={10000} placeholder="Escreva sua dúvida ou compartilhe sua dica..." value={newContent} onChange={(event) => setNewContent(event.target.value)} className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm font-bold text-foreground resize-none" /><p className="text-xs text-muted-foreground">O envio exige uma sessão autenticada e será encaminhado para moderação.</p><div className="flex justify-end gap-3 pt-3 border-t border-border"><button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted">Cancelar</button><button type="submit" disabled={submitting} className="bg-red-600 disabled:opacity-60 text-white px-6 py-2 rounded-xl text-xs font-bold">{submitting ? "Enviando…" : "Enviar para moderação"}</button></div></form></div></div>}
    </div>
  );
}
