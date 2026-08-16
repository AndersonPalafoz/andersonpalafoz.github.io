"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2, MessageCircle, Send, Star } from "lucide-react";
import { toast } from "sonner";

type Course = { id: number; title: string };
type Reply = { id: number; message: string; authorName: string; createdAt: string };
type Review = { id: number; rating: number; comment: string | null; authorName: string; createdAt: string; replies: Reply[] };

export default function AdminReviewsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [sendingId, setSendingId] = useState<number | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/courses", { cache: "no-store" });
        const data = await response.json();
        const nextCourses = (data.courses || data || []).map((course: Course) => ({ id: Number(course.id), title: course.title }));
        setCourses(nextCourses);
        if (nextCourses[0]) setCourseId(String(nextCourses[0].id));
      } catch { toast.error("Não foi possível carregar os cursos."); }
      finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    if (!courseId) return;
    void (async () => {
      setLoadingReviews(true);
      try {
        const response = await fetch(`/api/course-reviews/${courseId}`, { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Não foi possível carregar as avaliações.");
        setReviews(data.reviews || []);
      } catch (error) { toast.error(error instanceof Error ? error.message : "Erro ao carregar avaliações."); }
      finally { setLoadingReviews(false); }
    })();
  }, [courseId]);

  const sendReply = async (reviewId: number) => {
    const message = (replyDrafts[reviewId] || "").trim();
    if (!message) { toast.error("Escreva uma resposta antes de enviar."); return; }
    setSendingId(reviewId);
    try {
      const response = await fetch(`/api/course-reviews/${courseId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reviewId, message }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível responder à avaliação.");
      setReviews((current) => current.map((review) => review.id === reviewId ? { ...review, replies: [{ ...data.reply, authorName: "Equipe docente" }, ...review.replies] } : review));
      setReplyDrafts((current) => ({ ...current, [reviewId]: "" }));
      toast.success("Resposta enviada. O aluno foi notificado.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Erro ao enviar resposta."); }
    finally { setSendingId(null); }
  };

  return <div className="min-h-screen bg-gray-50 pb-12"><header className="border-b border-gray-200 bg-white"><div className="mx-auto max-w-6xl px-4 py-6 sm:px-6"><Link href="/admin" className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-red-600"><ChevronLeft size={16} /> Painel administrativo</Link><p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-red-600">Relacionamento acadêmico</p><h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950">Avaliações dos cursos</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">Responda comentários de alunos com transparência. Cada resposta gera um alerta na Central de Notificações do aluno.</p></div></header><main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6"><section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><label htmlFor="course-review-course" className="text-xs font-black uppercase tracking-widest text-gray-500">Curso</label><select id="course-review-course" value={courseId} onChange={(event) => setCourseId(event.target.value)} disabled={loading} className="mt-2 h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-900 outline-none focus:border-red-600 sm:max-w-xl">{courses.length === 0 ? <option value="">Nenhum curso disponível</option> : courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></section>{loadingReviews ? <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white py-16 text-red-600"><Loader2 className="animate-spin" size={28} /></div> : reviews.length === 0 ? <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center"><MessageCircle className="mx-auto text-gray-300" size={40} /><h2 className="mt-4 font-bold text-gray-900">Nenhuma avaliação neste curso</h2><p className="mt-1 text-sm text-gray-500">As avaliações dos alunos aparecerão aqui quando forem enviadas.</p></div> : <div className="space-y-4">{reviews.map((review) => <article key={review.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="font-black text-gray-900">{review.authorName}</h2><time className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString("pt-BR")}</time></div><div className="flex items-center gap-1" aria-label={`${review.rating} de 5 estrelas`}>{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={17} className={star <= review.rating ? "fill-amber-500 text-amber-500" : "text-gray-200"} />)}</div></div>{review.comment && <p className="mt-4 rounded-xl bg-gray-50 p-4 text-sm leading-6 text-gray-700">{review.comment}</p>}<div className="mt-4 space-y-3">{review.replies.map((reply) => <div key={reply.id} className="rounded-xl border-l-4 border-red-500 bg-red-50 px-4 py-3"><p className="text-xs font-black uppercase tracking-wide text-red-700">{reply.authorName}</p><p className="mt-1 text-sm leading-6 text-gray-700">{reply.message}</p></div>)}</div><div className="mt-5 flex flex-col gap-2 sm:flex-row"><textarea value={replyDrafts[review.id] || ""} onChange={(event) => setReplyDrafts((current) => ({ ...current, [review.id]: event.target.value }))} rows={2} maxLength={2000} placeholder="Escreva uma resposta respeitosa e pedagógica..." className="min-h-20 flex-1 resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none focus:border-red-600" /><button type="button" onClick={() => void sendReply(review.id)} disabled={sendingId === review.id} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"><Send size={16} />{sendingId === review.id ? "Enviando..." : "Responder"}</button></div></article>)}</div>}</main></div>;
}
