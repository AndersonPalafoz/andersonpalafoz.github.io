'use client';

import { useState } from "react";
import { Star, MessageSquare, Send, Check } from "lucide-react";

interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface CourseReviewsProps {
  courseId: number;
}

export function CourseReviewsSection({ courseId: _courseId }: CourseReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: "1",
      author: "Carlos Alberto",
      rating: 5,
      comment: "Excelente curso! A didática do professor Anderson é impecável e os materiais complementares ajudam muito.",
      createdAt: "Há 3 dias"
    },
    {
      id: "2",
      author: "Juliana Ribeiro",
      rating: 5,
      comment: "A organização das aulas e o foco na conversação prática fizeram toda a diferença para o meu aprendizado.",
      createdAt: "Há 1 semana"
    }
  ]);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !authorName.trim()) return;

    const newReview: Review = {
      id: Date.now().toString(),
      author: authorName,
      rating,
      comment,
      createdAt: "Agora mesmo"
    };

    setReviews([newReview, ...reviews]);
    setComment("");
    setAuthorName("");
    setToastMessage("Avaliação enviada com sucesso!");
    setTimeout(() => setToastMessage(null), 3500);
  };

  const avgRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div className="space-y-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-xs font-sans">
      {toastMessage && (
        <aside aria-label="Notificação" className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-3 border border-slate-800">
          <Check size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </aside>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="text-red-600" size={24} /> Avaliações e Feedbacks dos Alunos
          </h3>
          <p className="text-xs text-slate-500 mt-1">Opiniões reais de estudantes que concluíram este curso.</p>
        </div>
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/50 px-4 py-2 rounded-2xl">
          <Star size={18} className="fill-amber-500 text-amber-500" />
          <span className="text-lg font-black text-slate-900 dark:text-white">{avgRating}</span>
          <span className="text-xs font-bold text-slate-500">({reviews.length} avaliações)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-800/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
          <h4 className="text-sm font-black text-slate-900 dark:text-white">Deixe sua Avaliação</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Seu Nome</label>
              <input
                type="text"
                required
                placeholder="Ex: João da Silva"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-red-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nota (1 a 5 Estrelas)</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-slate-300 hover:scale-110 transition"
                  >
                    <Star size={24} className={star <= rating ? "fill-amber-500 text-amber-500" : "text-slate-300"} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Seu Comentário ou Feedback</label>
              <textarea
                required
                rows={3}
                placeholder="O que você achou do conteúdo, da metodologia e dos materiais?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-red-600"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-xs py-3 rounded-xl shadow-sm transition flex items-center justify-center gap-2"
            >
              <Send size={14} /> Publicar Avaliação
            </button>
          </form>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <h4 className="text-sm font-black text-slate-900 dark:text-white">Comentários Recentes</h4>
          {reviews.map((rev) => (
            <div key={rev.id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-black text-xs flex items-center justify-center">
                    {rev.author.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{rev.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < rev.rating ? "fill-amber-500 text-amber-500" : "text-slate-200"} />
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{rev.comment}</p>
              <p className="text-[10px] text-slate-400">{rev.createdAt}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
