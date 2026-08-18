"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Search, User, X } from "lucide-react";

type BlogArticle = {
  id: number;
  slug: string;
  title: string;
  content: string | null;
  category: string | null;
  published: Date | string | null;
};

export function BlogBrowser({ articles }: { articles: BlogArticle[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const categories = useMemo(() => ["Todos", ...Array.from(new Set(articles.map((article) => article.category).filter((value): value is string => Boolean(value))))], [articles]);
  const filteredArticles = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    return articles.filter((article) => {
      const searchable = `${article.title} ${article.content || ""} ${article.category || ""}`.toLocaleLowerCase("pt-BR");
      return (!normalizedQuery || searchable.includes(normalizedQuery)) && (category === "Todos" || article.category === category);
    });
  }, [articles, category, query]);

  return (
    <section aria-labelledby="published-articles-title" className="space-y-8">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div><h2 id="published-articles-title" className="text-2xl font-black text-gray-900">Artigos publicados</h2><p className="text-sm text-gray-600" aria-live="polite">{filteredArticles.length} {filteredArticles.length === 1 ? "artigo encontrado" : "artigos encontrados"}</p></div>
          <div className="relative w-full md:max-w-sm"><Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><label htmlFor="blog-search" className="sr-only">Buscar artigos</label><input id="blog-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar artigos..." className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-10 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-600 focus:ring-2 focus:ring-red-200" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Limpar busca" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-500 hover:bg-gray-100"><X size={16} /></button>}</div>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Filtrar artigos por categoria">
          {categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item} className={`rounded-full border px-4 py-2 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 ${category === item ? "border-red-600 bg-red-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"}`}>{item}</button>)}
        </div>
      </div>

      {filteredArticles.length === 0 ? <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center"><h3 className="text-lg font-bold text-gray-900">Nenhum artigo corresponde aos filtros</h3><p className="mt-2 text-sm text-gray-600">Tente outra palavra-chave ou remova o filtro de categoria.</p><button type="button" onClick={() => { setQuery(""); setCategory("Todos"); }} className="mt-5 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2">Limpar filtros</button></div> : <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">{filteredArticles.map((article) => <Link key={article.id} href={`/blog/${article.slug}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:-translate-y-1 hover:border-red-300 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"><div className="flex h-24 items-center bg-gradient-to-br from-red-600 to-red-700 p-6 text-white"><span className="text-sm font-semibold">{article.category || "Blog"}</span></div><div className="flex flex-1 flex-col p-8"><h3 className="mb-3 line-clamp-2 text-xl font-bold text-gray-900 group-hover:text-red-700">{article.title}</h3>{article.content && <p className="mb-6 line-clamp-2 flex-1 text-sm text-gray-600">{article.content}</p>}<div className="space-y-3 border-t border-gray-200 pt-6"><div className="flex items-center gap-2 text-sm text-gray-600"><User size={16} className="text-red-600" aria-hidden="true" /><span>Anderson Palafoz</span></div><div className="flex items-center gap-2 text-sm text-gray-600"><Calendar size={16} className="text-red-600" aria-hidden="true" /><time dateTime={article.published ? new Date(article.published).toISOString() : undefined}>{article.published ? new Date(article.published).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" }) : "Data não informada"}</time></div></div><div className="mt-6 flex items-center gap-2 font-semibold text-red-600">Ler mais <ArrowRight size={18} aria-hidden="true" /></div></div></Link>)}</div>}
    </section>
  );
}
