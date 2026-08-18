'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, CheckCircle2, Edit3, Loader2, Search, Shield, Trash2, XCircle } from "lucide-react";

type ForumStatus = "pending" | "approved" | "rejected" | "resolved";

type AdminForumPost = {
  id: number;
  title: string;
  authorName: string | null;
  authorEmail: string | null;
  category: string;
  content: string;
  audioUrl: string | null;
  status: ForumStatus;
  moderationNote: string | null;
  createdAt: string;
  updatedAt: string;
  replies: number;
};

const statusLabels: Record<ForumStatus, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
  resolved: "Resolvido",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function AdminForumModerationPage() {
  const [posts, setPosts] = useState<AdminForumPost[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | ForumStatus>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState({ title: "", content: "", category: "" });

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());
      const response = await fetch(`/api/admin/forum?${params.toString()}`, { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Não foi possível carregar a moderação.");
      setPosts(body.posts || []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível carregar os tópicos persistidos.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = window.setTimeout(loadPosts, 180);
    return () => window.clearTimeout(timer);
  }, [loadPosts]);

  const pendingCount = useMemo(() => posts.filter((post) => post.status === "pending").length, [posts]);

  async function updatePost(postId: number, payload: Record<string, unknown>, successMessage: string) {
    try {
      setSavingId(postId);
      setError(null);
      const response = await fetch("/api/admin/forum", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, ...payload }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Não foi possível atualizar o tópico.");
      setNotice(successMessage);
      setEditingId(null);
      await loadPosts();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível atualizar o tópico.");
    } finally {
      setSavingId(null);
    }
  }

  async function rejectPost(postId: number) {
    if (!window.confirm("Rejeitar este tópico? Ele deixará de aparecer no fórum público.")) return;
    try {
      setSavingId(postId);
      const response = await fetch(`/api/admin/forum?id=${postId}`, { method: "DELETE" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Não foi possível rejeitar o tópico.");
      setNotice("Tópico rejeitado e registrado na auditoria.");
      await loadPosts();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível rejeitar o tópico.");
    } finally {
      setSavingId(null);
    }
  }

  function startEdit(post: AdminForumPost) {
    setEditingId(post.id);
    setEditDraft({ title: post.title, content: post.content, category: post.category });
  }

  return (
    <div className="page-container py-8 sm:py-10 space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:underline mb-3">
            <ArrowLeft size={14} /> Voltar ao Dashboard
          </Link>
          <h1 className="text-3xl font-black text-foreground flex items-center gap-3"><Shield className="text-red-600" size={28} /> Moderação do Fórum</h1>
          <p className="text-sm text-muted-foreground mt-2">Tópicos e respostas são exibidos somente quando existem no banco de dados.</p>
        </div>
        <div className="surface-card px-4 py-3 text-xs font-bold text-foreground">{pendingCount} pendente(s) nesta consulta</div>
      </div>

      {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800">{notice}</div>}
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-800">{error}</div>}

      <div className="surface-card p-4 flex flex-col sm:flex-row gap-3">
        <label className="relative flex-1">
          <span className="sr-only">Pesquisar tópicos</span>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar por título ou conteúdo" className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2.5 text-sm text-foreground" />
        </label>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | ForumStatus)} className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground">
          <option value="all">Todos os status</option>
          {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <button type="button" onClick={loadPosts} className="rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-foreground hover:bg-muted">Atualizar</button>
      </div>

      {loading ? (
        <div className="surface-card p-10 flex items-center justify-center gap-3 text-sm text-muted-foreground"><Loader2 className="animate-spin" size={18} /> Carregando registros reais…</div>
      ) : posts.length === 0 ? (
        <div className="surface-card p-12 text-center text-sm text-muted-foreground">Nenhum tópico persistido corresponde aos filtros atuais.</div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <article key={post.id} className="surface-card p-5 sm:p-6 space-y-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700">{post.category}</span>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-muted-foreground">{statusLabels[post.status]}</span>
                  </div>
                  {editingId === post.id ? (
                    <input value={editDraft.title} onChange={(event) => setEditDraft((draft) => ({ ...draft, title: event.target.value }))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-lg font-black text-foreground" />
                  ) : <h2 className="text-lg font-black text-foreground">{post.title}</h2>}
                  <p className="text-xs text-muted-foreground mt-1">{post.authorName || "Usuário sem nome"} · {post.authorEmail || "e-mail não informado"} · {formatDate(post.createdAt)}</p>
                </div>
                <span className="text-xs text-muted-foreground">{post.replies} resposta(s)</span>
              </div>

              {editingId === post.id ? (
                <div className="space-y-3">
                  <textarea value={editDraft.content} onChange={(event) => setEditDraft((draft) => ({ ...draft, content: event.target.value }))} rows={5} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" />
                  <input value={editDraft.category} onChange={(event) => setEditDraft((draft) => ({ ...draft, category: event.target.value }))} className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" />
                </div>
              ) : <p className="text-sm leading-6 text-foreground/80 whitespace-pre-wrap">{post.content}</p>}

              {post.audioUrl && <audio controls preload="none" src={post.audioUrl} className="w-full" aria-label={`Áudio do tópico ${post.title}`} />}
              {post.moderationNote && <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">Nota de moderação: {post.moderationNote}</p>}

              <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                {editingId === post.id ? (
                  <>
                    <button type="button" disabled={savingId === post.id} onClick={() => updatePost(post.id, editDraft, "Tópico editado e salvo.")} className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-60"><Check size={14} /> Salvar edição</button>
                    <button type="button" onClick={() => setEditingId(null)} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-bold text-foreground"><XCircle size={14} /> Cancelar</button>
                  </>
                ) : (
                  <>
                    {post.status === "pending" && <button type="button" disabled={savingId === post.id} onClick={() => updatePost(post.id, { status: "approved" }, "Tópico aprovado e registrado.")} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-60"><CheckCircle2 size={14} /> Aprovar</button>}
                    {post.status === "approved" && <button type="button" disabled={savingId === post.id} onClick={() => updatePost(post.id, { status: "resolved" }, "Tópico marcado como resolvido.")} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-60"><CheckCircle2 size={14} /> Resolver</button>}
                    <button type="button" onClick={() => startEdit(post)} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-bold text-foreground hover:bg-muted"><Edit3 size={14} /> Editar</button>
                    {post.status !== "rejected" && <button type="button" disabled={savingId === post.id} onClick={() => rejectPost(post.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-60"><Trash2 size={14} /> Rejeitar</button>}
                  </>
                )}
                {savingId === post.id && <Loader2 size={16} className="animate-spin text-muted-foreground self-center" />}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
