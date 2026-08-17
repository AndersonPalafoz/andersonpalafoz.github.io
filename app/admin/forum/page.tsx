'use client';

import { useState } from "react";
import Link from "next/link";
import { Shield, CheckCircle2, Trash2, Edit3, ArrowLeft, Check, Mic } from "lucide-react";

interface AdminForumPost {
  id: string;
  title: string;
  author: string;
  category: string;
  content: string;
  audioUrl?: string;
  status: "approved" | "pending";
  likes: number;
  replies: number;
  createdAt: string;
}

export default function AdminForumModerationPage() {
  const [posts, setPosts] = useState<AdminForumPost[]>([
    {
      id: "1",
      title: "Como diferenciar 'Present Perfect' de 'Simple Past' de vez?",
      author: "Mariana Souza",
      category: "Gramática",
      content: "Sempre me confundo quando usar 'I have visited' ou 'I visited last year'.",
      status: "approved",
      likes: 14,
      replies: 5,
      createdAt: "Há 2 horas"
    },
    {
      id: "2",
      title: "Dica de ouro: expressões idiomáticas para usar no trabalho",
      author: "Anderson Palafoz",
      category: "Dicas",
      content: "Pessoal, 'to touch base' e 'to keep me in the loop' são fundamentais.",
      audioUrl: "sample.webm",
      status: "approved",
      likes: 32,
      replies: 9,
      createdAt: "Há 1 dia"
    },
    {
      id: "3",
      title: "Dúvida sobre pronúncia do 'th' (voiced vs unvoiced)",
      author: "Lucas Mendes",
      category: "Pronúncia",
      content: "Como posicionar a língua corretamente em 'think' versus 'that'?",
      audioUrl: "sample-2.webm",
      status: "pending",
      likes: 2,
      replies: 0,
      createdAt: "Há 10 minutos"
    }
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleApprove = (id: string) => {
    setPosts(posts.map(p => p.id === id ? { ...p, status: "approved" } : p));
    setToastMessage("Tópico aprovado e publicado com sucesso!");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDelete = (id: string) => {
    setPosts(posts.filter(p => p.id !== id));
    setToastMessage("Tópico removido pelo moderador.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8 font-sans">
      {toastMessage && (
        <aside aria-label="Notificação" className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-3 border border-slate-800">
          <Check size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </aside>
      )}

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link href="/dashboard" className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline inline-flex items-center gap-1.5 mb-2">
            <ArrowLeft size={14} /> Voltar ao Dashboard
          </Link>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Shield className="text-red-600" size={28} /> Moderação do Fórum (Admin)
          </h1>
          <p className="text-xs text-slate-500">Gerencie, aprove, edite ou remova tópicos e áudios de pronúncia enviados pelos alunos.</p>
        </div>
        <div className="bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/40 px-4 py-2 rounded-2xl text-xs font-bold text-red-700 dark:text-red-300">
          {posts.filter(p => p.status === "pending").length} pendentes de aprovação
        </div>
      </div>

      <div className="grid gap-4">
        {posts.map((post) => (
          <div key={post.id} className={`bg-white dark:bg-slate-900 border p-6 rounded-2xl shadow-xs space-y-4 transition ${post.status === "pending" ? "border-amber-300 dark:border-amber-900 bg-amber-50/20" : "border-slate-200 dark:border-slate-800"}`}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-black text-xs flex items-center justify-center">
                  {post.author.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{post.author}</p>
                  <p className="text-[10px] text-slate-500">{post.createdAt} • Categoria: <span className="font-bold text-red-600">{post.category}</span></p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${post.status === "approved" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"}`}>
                  {post.status === "approved" ? "Aprovado / Público" : "Aguardando Moderação"}
                </span>
              </div>
            </div>

            <h3 className="text-base font-black text-slate-900 dark:text-white">{post.title}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{post.content}</p>

            {post.audioUrl && (
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 w-fit">
                <Mic size={15} className="text-red-600" /> Contém clipe de áudio para pronúncia
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 flex-wrap gap-4">
              <div className="flex items-center gap-4 text-xs text-slate-500 font-bold">
                <span>{post.likes} Curtidas</span>
                <span>{post.replies} Respostas</span>
              </div>

              <div className="flex items-center gap-2">
                {post.status === "pending" && (
                  <button
                    type="button"
                    onClick={() => handleApprove(post.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={15} /> Aprovar Tópico
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setToastMessage("Modo de edição rápida aberto para o tópico.")}
                  className="border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Edit3 size={15} /> Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(post.id)}
                  className="bg-red-50 hover:bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Trash2 size={15} /> Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
