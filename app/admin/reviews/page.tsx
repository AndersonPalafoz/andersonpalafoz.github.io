"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2, MessageCircle, Send, Star, BookOpen, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type Course = { id: number; title: string };
type Article = { id: number; title: string };
type Reply = { id: number; message: string; authorName: string; createdAt: string };
type Review = { id: number; rating: number; comment: string | null; authorName: string; createdAt: string; replies: Reply[] };

export default function AdminReviewsPage() {
  const [mode, setMode] = useState<"courses" | "articles">("courses");
  const [courses, setCourses] = useState<Course[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [courseId, setCourseId] = useState("");
  const [articleId, setArticleId] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (selectedCourseId: string, selectedArticleId: string) => {
    try {
      setLoadingReviews(Boolean(selectedCourseId || selectedArticleId));
      setError(null);
      
      if (mode === "courses") {
        const params = selectedCourseId ? `?courseId=${encodeURIComponent(selectedCourseId)}` : "";
        const response = await fetch(`/api/admin/reviews${params}`, { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Não foi possível carregar as avaliações de cursos.");
        setCourses(data.courses || []);
        setReviews(data.reviews || []);
      } else {
        const params = selectedArticleId ? `?articleId=${encodeURIComponent(selectedArticleId)}` : "";
        const response = await fetch(`/api/admin/article-reviews${params}`, { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Não foi possível carregar os comentários do blog.");
        setArticles(data.articles || []);
        setReviews(data.reviews || []);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível carregar os dados.");
      setReviews([]);
    } finally {
      setLoading(false);
      setLoadingReviews(false);
    }
  }, [mode]);

  useEffect(() => {
    void loadData(courseId, articleId);
  }, [courseId, articleId, mode, loadData]);

  const sendReply = async (reviewId: number) => {
    const message = (replyDrafts[reviewId] || "").trim();
    if (!message) { toast.error("Escreva uma resposta antes de enviar."); return; }
    if (mode === "courses" && !courseId) { toast.error("Selecione um curso persistido."); return; }
    if (mode === "articles" && !articleId) { toast.error("Selecione um artigo persistido."); return; }
    
    setSendingId(reviewId);
    try {
      const endpoint = mode === "courses" ? "/api/admin/reviews" : "/api/admin/article-reviews";
      const payloadKey = mode === "courses" ? { courseId, reviewId, message } : { articleId, reviewId, message };
      
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadKey),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível responder.");
      
      setReviews((current) => current.map((review) => review.id === reviewId ? { ...review, replies: [data.reply, ...review.replies] } : review));
      setReplyDrafts((current) => ({ ...current, [reviewId]: "" }));
      toast.success("Resposta enviada com selo oficial de professor e notificada.");
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Erro ao enviar resposta.");
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-12 text-foreground">
      <header className="border-b border-border bg-card text-card-foreground">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <Link href="/admin" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-red-600">
            <ChevronLeft size={16} /> Painel administrativo
          </Link>
          <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-red-600">Relacionamento e Moderação</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">Central de Comentários e Avaliações</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Filtre por curso ou artigo, analise feedback dos alunos e responda com o selo oficial de professor.
          </p>

          <div className="mt-6 flex gap-3 border-b border-border pb-px">
            <button
              type="button"
              onClick={() => { setMode("courses"); setCourseId(""); setReviews([]); }}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-bold transition ${
                mode === "courses" ? "border-red-600 text-red-600 dark:text-red-400" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen size={16} /> Avaliações de Cursos
            </button>
            <button
              type="button"
              onClick={() => { setMode("articles"); setArticleId(""); setReviews([]); }}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-bold transition ${
                mode === "articles" ? "border-red-600 text-red-600 dark:text-red-400" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText size={16} /> Comentários do Blog
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm text-card-foreground">
          {mode === "courses" ? (
            <div>
              <label htmlFor="filter-course" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Filtrar por Curso</label>
              <select
                id="filter-course"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                disabled={loading}
                className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground outline-none focus:border-red-600 sm:max-w-xl"
              >
                <option value="">Selecione um curso para gerenciar avaliações</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label htmlFor="filter-article" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Filtrar por Artigo do Blog</label>
              <select
                id="filter-article"
                value={articleId}
                onChange={(e) => setArticleId(e.target.value)}
                disabled={loading}
                className="mt-2 h-12 w-full rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground outline-none focus:border-red-600 sm:max-w-xl"
              >
                <option value="">Selecione um artigo para gerenciar comentários</option>
                {articles.map((a) => (
                  <option key={a.id} value={a.id}>{a.title}</option>
                ))}
              </select>
            </div>
          )}
        </section>

        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800 dark:bg-red-950/40 dark:text-red-300">
            {error}
            <button type="button" onClick={() => void loadData(courseId, articleId)} className="ml-3 underline">Tentar novamente</button>
          </div>
        )}

        {loading || loadingReviews ? (
          <div className="flex items-center justify-center rounded-2xl border border-border bg-card py-16 text-red-600">
            <Loader2 className="animate-spin" size={28} />
          </div>
        ) : (mode === "courses" && !courseId) || (mode === "articles" && !articleId) ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
            <MessageCircle className="mx-auto text-muted-foreground/40" size={40} />
            <h2 className="mt-4 font-bold text-foreground">Selecione um item no filtro acima</h2>
            <p className="mt-1 text-sm text-muted-foreground">As interações reais e comentários cadastrados serão exibidos imediatamente.</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
            <MessageCircle className="mx-auto text-muted-foreground/40" size={40} />
            <h2 className="mt-4 font-bold text-foreground">Nenhuma interação encontrada</h2>
            <p className="mt-1 text-sm text-muted-foreground">Não há comentários ou avaliações registrados para este item.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <article key={review.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm text-card-foreground">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="font-black text-foreground">{review.authorName}</h2>
                    <time className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString("pt-BR")}</time>
                  </div>
                  {mode === "courses" && review.rating && (
                    <div className="flex items-center gap-1" aria-label={`${review.rating} de 5 estrelas`}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={17} className={star <= review.rating ? "fill-amber-500 text-amber-500" : "text-gray-200"} />
                      ))}
                    </div>
                  )}
                </div>

                {review.comment && (
                  <p className="mt-4 rounded-xl bg-background p-4 text-sm leading-6 text-foreground border border-border/60">
                    {review.comment}
                  </p>
                )}

                <div className="mt-4 space-y-3">
                  {review.replies.map((reply) => (
                    <div key={reply.id} className="rounded-xl border-l-4 border-red-500 bg-red-50/70 dark:bg-red-950/20 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wide text-red-700 dark:text-red-300">{reply.authorName}</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-black uppercase text-white shadow-sm">
                          <CheckCircle2 size={11} /> Resposta do Professor
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm leading-6 text-foreground">{reply.message}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <textarea
                    value={replyDrafts[review.id] || ""}
                    onChange={(event) => setReplyDrafts((current) => ({ ...current, [review.id]: event.target.value }))}
                    rows={2}
                    maxLength={2000}
                    placeholder="Escreva uma resposta oficial com o selo de professor..."
                    className="min-h-20 flex-1 resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-red-600"
                  />
                  <button
                    type="button"
                    onClick={() => void sendReply(review.id)}
                    disabled={sendingId === review.id}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
                  >
                    <Send size={16} />
                    {sendingId === review.id ? "Enviando..." : "Responder com Selo"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
