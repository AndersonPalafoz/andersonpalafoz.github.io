"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Calendar, Clock, Star, MessageSquare, Send, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface CommentReply {
  id: number;
  message: string;
  authorName: string;
  createdAt: string;
}

interface Comment {
  id: number;
  userName: string;
  userEmail?: string;
  rating: number;
  comment: string;
  createdAt: string;
  replies?: CommentReply[];
}

export default function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [article, setArticle] = useState<any>(null);
  const [loadingArticle, setLoadingArticle] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);

  // Form states
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [rating, setRating] = useState(5);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchArticleAndComments() {
      try {
        setLoadingArticle(true);
        const res = await fetch("/api/articles");
        const data = await res.json();
        const found = (data.articles || []).find((a: any) => a.slug === slug);
        setArticle(found || null);

        if (found) {
          const comRes = await fetch(`/api/articles/${found.id}/comments`);
          const comData = await comRes.json();
          setComments(comData.comments || []);
        }
      } catch (err) {
        console.error("Erro ao carregar artigo:", err);
      } finally {
        setLoadingArticle(false);
        setLoadingComments(false);
      }
    }
    fetchArticleAndComments();
  }, [slug]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !commentText.trim()) {
      toast.error("Por favor, preencha seu nome e seu comentário.");
      return;
    }

    if (!article) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/articles/${article.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName,
          userEmail,
          rating,
          comment: commentText,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Comentário e avaliação enviados com sucesso!");
        setComments([data.comment, ...comments]);
        setCommentText("");
      } else {
        toast.error(data.error || "Erro ao enviar comentário.");
      }
    } catch (err) {
      console.error("Erro ao enviar comentário:", err);
      toast.error("Erro ao enviar comentário.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingArticle) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-2 text-red-600">
          <Loader2 className="animate-spin" size={24} />
          <span>Carregando artigo...</span>
        </div>
      </div>
    );
  }

  if (!article || !article.published) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Artigo não encontrado</h1>
        <p className="text-gray-600 dark:text-slate-400 mb-6">O artigo solicitado pode ter sido removido ou não está publicado.</p>
        <Link href="/blog" className="text-red-600 font-semibold hover:underline">
          ← Voltar para o Blog
        </Link>
      </div>
    );
  }

  const publishedDate = new Date(article.published).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const averageRating = comments.length > 0
    ? (comments.reduce((acc, c) => acc + c.rating, 0) / comments.length).toFixed(1)
    : "5.0";

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Breadcrumbs
          items={[
            { label: "Blog", href: "/blog" },
            { label: article.title, href: `/blog/${article.slug}` },
          ]}
        />

        <article className="mt-8">
          {article.category && (
            <span className="inline-block bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold mb-4">
              {article.category}
            </span>
          )}

          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white leading-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-slate-400 mb-8 text-sm border-b border-gray-100 dark:border-slate-800 pb-6">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-red-600" />
              <span>{publishedDate}</span>
            </div>
            {article.readingTime && (
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-red-600" />
                <span>{article.readingTime} min de leitura</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-amber-500 font-semibold bg-amber-50 px-3 py-1 rounded-full text-xs">
              <Star size={14} className="fill-amber-500 text-amber-500" />
              <span>{averageRating} ({comments.length} avaliações)</span>
            </div>
          </div>

          <div className="prose prose-slate max-w-none text-gray-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed text-lg mb-12">
            {article.content}
          </div>
        </article>

        {/* Seção de Comentários e Avaliações */}
        <section className="mt-16 pt-12 border-t border-gray-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="text-red-600" size={24} />
              Avaliações e Comentários ({comments.length})
            </h3>
          </div>

          {/* Formulário de Envio */}
          <div className="bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 p-6 md:p-8 rounded-2xl mb-12 shadow-sm">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Deixe sua avaliação e comentário</h4>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-6">
              Sua opinião é fundamental para a melhoria contínua dos conteúdos acadêmicos.
            </p>

            <form onSubmit={handleCommentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-400 mb-1">Seu Nome *</label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Ex: Maria Silva"
                    className="w-full h-11 px-4 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-red-600 text-sm transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-400 mb-1">Seu E-mail (opcional)</label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full h-11 px-4 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-red-600 text-sm transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-400 mb-1">Avaliação por Estrelas</label>
                <div className="flex items-center gap-2 py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition transform hover:scale-110"
                    >
                      <Star
                        size={28}
                        className={star <= rating ? "fill-amber-500 text-amber-500" : "text-gray-300 dark:text-slate-600"}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-semibold text-gray-700 dark:text-slate-300">{rating} de 5 estrelas</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-slate-400 mb-1">Seu Comentário *</label>
                <textarea
                  required
                  rows={4}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Escreva sua reflexão, dúvida ou contribuição sobre o artigo..."
                  className="w-full p-4 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:border-red-600 text-sm transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Publicar Comentário</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Lista de Comentários */}
          {loadingComments ? (
            <div className="text-center py-8 text-gray-500 dark:text-slate-400">Carregando comentários...</div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-800">
              <MessageSquare size={48} className="mx-auto text-gray-300 dark:text-slate-600 mb-3" />
              <p className="text-gray-600 dark:text-slate-400 font-medium">Nenhum comentário ainda.</p>
              <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">Seja o primeiro a avaliar e comentar este artigo!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((c) => (
                <div key={c.id} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-3 transition hover:border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-gray-900 dark:text-white">{c.userName}</h5>
                      <span className="text-xs text-gray-400 dark:text-slate-500">
                        {new Date(c.createdAt).toLocaleDateString("pt-BR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={star <= c.rating ? "fill-amber-500 text-amber-500" : "text-gray-200 dark:text-slate-700"}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed">{c.comment}</p>
                  {(c.replies || []).length > 0 && (
                    <div className="mt-5 space-y-3 border-l-4 border-red-500 pl-4">
                      {(c.replies || []).map((reply) => (
                        <div key={reply.id} className="rounded-xl bg-red-50/70 p-4 dark:bg-red-950/20">
                          <div className="flex flex-wrap items-center gap-2">
                            <strong className="text-sm text-red-700 dark:text-red-300">{reply.authorName}</strong>
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white"><CheckCircle2 size={11} /> Resposta do Professor</span>
                            <time className="text-xs text-gray-500 dark:text-slate-400">{new Date(reply.createdAt).toLocaleDateString("pt-BR")}</time>
                          </div>
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700 dark:text-slate-300">{reply.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
