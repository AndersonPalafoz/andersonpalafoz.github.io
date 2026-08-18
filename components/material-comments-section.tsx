"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { MessageSquare, Send, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface CommentUser {
  id: number;
  name: string | null;
  email: string | null;
  role: string;
  avatarUrl: string | null;
}

interface CommentItem {
  id: number;
  content: string;
  parentId: number | null;
  createdAt: string;
  user: CommentUser;
}

export function MaterialCommentsSection({ materialId }: { materialId: number }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadComments = async () => {
    try {
      const res = await fetch(`/api/materials/${materialId}/comments`, { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.comments) {
        setComments(data.comments);
      }
    } catch {
      // Ignorar erro de rede silenciosamente
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadComments();
  }, [materialId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!session) {
      toast.error("Você precisa estar conectado para enviar dúvidas.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/materials/${materialId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao enviar comentário");
      setNewComment("");
      toast.success("Dúvida enviada com sucesso ao professor!");
      await loadComments();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao enviar comentário.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-12 border-t border-gray-200 dark:border-slate-800 pt-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
          <MessageSquare size={20} />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white">Dúvidas e Comentários</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Tire suas dúvidas sobre este material diretamente com o professor.</p>
        </div>
      </div>

      {session ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Digite sua dúvida ou comentário sobre este material..."
            className="w-full rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:border-red-500 resize-y shadow-xs"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-red-600/20 transition hover:bg-red-700 disabled:opacity-60"
            >
              {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              Enviar Dúvida
            </button>
          </div>
        </form>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 p-6 text-center text-xs text-gray-600 dark:text-gray-400">
          Faça login na plataforma para enviar dúvidas e interagir nos materiais didáticos.
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8 text-red-600">
          <Loader2 className="animate-spin" size={24} />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-gray-500 dark:text-gray-400 italic">Nenhuma dúvida registrada ainda. Seja o primeiro a perguntar!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {comment.user.avatarUrl ? (
                    <img src={comment.user.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 font-bold text-xs">
                      {comment.user.name ? comment.user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">{comment.user.name || "Aluno(a)"}</span>
                      {comment.user.role === "admin" || comment.user.role === "professor" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-950/60 px-2 py-0.5 text-[10px] font-black text-red-600 dark:text-red-400">
                          <ShieldCheck size={11} /> Professor
                        </span>
                      ) : null}
                    </div>
                    <time className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleString("pt-BR")}</time>
                  </div>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-gray-700 dark:text-gray-300 pl-10 whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
