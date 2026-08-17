'use client';

import { useState } from "react";
import { MessageSquare, ThumbsUp, Search, PlusCircle, Sparkles, Tag, Send } from "lucide-react";

interface DiscussionPost {
  id: string;
  title: string;
  author: string;
  category: string;
  content: string;
  likes: number;
  replies: number;
  createdAt: string;
}

export default function ForumPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Gramática");
  const [newContent, setNewContent] = useState("");

  const [posts, setPosts] = useState<DiscussionPost[]>([
    {
      id: "1",
      title: "Como diferenciar 'Present Perfect' de 'Simple Past' de vez?",
      author: "Mariana Souza",
      category: "Gramática",
      content: "Sempre me confundo quando usar 'I have visited' ou 'I visited last year'. Alguém tem uma dica prática?",
      likes: 14,
      replies: 5,
      createdAt: "Há 2 horas"
    },
    {
      id: "2",
      title: "Dica de ouro: expressões idiomáticas para usar no trabalho",
      author: "Anderson Palafoz",
      category: "Dicas",
      content: "Pessoal, 'to touch base' e 'to keep me in the loop' são fundamentais em reuniões corporativas em inglês. Pratiquem em frases!",
      likes: 32,
      replies: 9,
      createdAt: "Há 1 dia"
    },
    {
      id: "3",
      title: "Dúvida sobre pronúncia do 'th' (voiced vs unvoiced)",
      author: "Lucas Mendes",
      category: "Pronúncia",
      content: "Como posicionar a língua corretamente em 'think' versus 'that'? Sinto que o som sai abafado.",
      likes: 8,
      replies: 3,
      createdAt: "Há 2 dias"
    }
  ]);

  const categories = ["Todos", "Gramática", "Pronúncia", "Dicas", "Vocabulário"];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleLike = (id: string) => {
    setPosts(posts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const created: DiscussionPost = {
      id: Date.now().toString(),
      title: newTitle,
      author: "Você (Aluno)",
      category: newCategory,
      content: newContent,
      likes: 1,
      replies: 0,
      createdAt: "Agora mesmo"
    };

    setPosts([created, ...posts]);
    setNewTitle("");
    setNewContent("");
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8 font-sans">
      <div className="bg-gradient-to-r from-red-600 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
            <MessageSquare size={15} /> Comunidade Acadêmica
          </div>
          <h1 className="text-3xl font-black tracking-tight">Fórum de Discussão e Dicas de Inglês</h1>
          <p className="text-white/90 text-sm max-w-xl leading-relaxed">
            Tire suas dúvidas, compartilhe descobertas e interaja com outros estudantes e com o professor Anderson Palafoz em um ambiente focado em aprendizado real.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-red-600 hover:bg-slate-100 font-black text-xs px-6 py-3.5 rounded-2xl shadow-lg transition flex items-center gap-2 shrink-0"
        >
          <PlusCircle size={17} /> Nova Discussão
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar dúvidas ou dicas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-red-600"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${selectedCategory === cat ? "bg-red-600 text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredPosts.map((post) => (
          <div key={post.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs hover:border-red-300 transition space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-black text-xs flex items-center justify-center">
                  {post.author.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{post.author}</p>
                  <p className="text-[10px] text-slate-500">{post.createdAt}</p>
                </div>
              </div>
              <span className="bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-900/40 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5">
                <Tag size={12} /> {post.category}
              </span>
            </div>

            <h2 className="text-base font-black text-slate-900 dark:text-white">{post.title}</h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{post.content}</p>

            <div className="flex items-center gap-6 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500">
              <button
                type="button"
                onClick={() => handleLike(post.id)}
                className="flex items-center gap-1.5 hover:text-red-600 transition"
              >
                <ThumbsUp size={15} /> {post.likes} Curtidas
              </button>
              <span className="flex items-center gap-1.5">
                <MessageSquare size={15} /> {post.replies} Respostas
              </span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="text-red-600" size={18} /> Nova Discussão no Fórum
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white font-black"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Título da Dúvida ou Dica</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Qual a melhor forma de treinar listening?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Categoria</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-red-600"
                >
                  <option value="Gramática">Gramática</option>
                  <option value="Pronúncia">Pronúncia</option>
                  <option value="Dicas">Dicas</option>
                  <option value="Vocabulário">Vocabulário</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Conteúdo</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Descreva detalhadamente sua dúvida ou compartilhe sua dica com a comunidade..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-red-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-sm flex items-center gap-2"
                >
                  <Send size={14} /> Publicar Discussão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
