"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, FileText } from "lucide-react";
import { track } from "@vercel/analytics";

export type HomepageMaterialPreview = {
  id: number;
  title: string;
  description: string | null;
  category: string;
  level: string;
};

export type HomepageArticlePreview = {
  title: string;
  slug: string;
  category: string | null;
  published: string;
  readingTime: number;
  excerpt: string;
};

export function HomepageContentHighlights({
  materials,
  articles,
}: {
  materials: HomepageMaterialPreview[];
  articles: HomepageArticlePreview[];
}) {
  if (materials.length === 0 && articles.length === 0) return null;

  return (
    <section
      aria-labelledby="homepage-content-title"
      className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12"
    >
      <div className="mb-8 max-w-2xl">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-red-600">
          Explore e pratique
        </p>
        <h2
          id="homepage-content-title"
          className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl"
        >
          Conteúdo para avançar no seu ritmo.
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
          Conheça materiais e artigos publicados para estudar com autonomia e encontrar seu próximo passo.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {materials.length > 0 && (
          <section aria-labelledby="homepage-materials-title">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h3 id="homepage-materials-title" className="text-xl font-black text-slate-900 dark:text-white">
                  Materiais para praticar
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Recursos públicos para o seu estudo.
                </p>
              </div>
              <Link
                href="/materiais"
                onClick={() => track("homepage_cta_click", { action: "materials", placement: "content-highlights" })}
                className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-lg px-2 text-xs font-bold text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 dark:text-red-300 dark:hover:bg-red-950/40"
              >
                Ver todos <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
            <ul className="grid gap-3">
              {materials.map((material) => (
                <li key={material.id}>
                  <Link
                    href={`/materiais/${material.id}`}
                    onClick={() => track("homepage_cta_click", { action: "material", placement: "content-card" })}
                    className="group flex min-h-28 items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-red-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-red-900"
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300">
                      <BookOpen size={20} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        <span>{material.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{material.level}</span>
                      </span>
                      <span className="mt-2 block font-bold text-slate-900 group-hover:text-red-700 dark:text-white dark:group-hover:text-red-300">
                        {material.title}
                      </span>
                      {material.description && (
                        <span className="mt-1 line-clamp-2 block text-sm leading-6 text-slate-600 dark:text-slate-300">
                          {material.description}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {articles.length > 0 && (
          <section aria-labelledby="homepage-articles-title">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h3 id="homepage-articles-title" className="text-xl font-black text-slate-900 dark:text-white">
                  Artigos recentes
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Ideias e orientação para aprender inglês.
                </p>
              </div>
              <Link
                href="/blog"
                onClick={() => track("homepage_cta_click", { action: "blog", placement: "content-highlights" })}
                className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-lg px-2 text-xs font-bold text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 dark:text-red-300 dark:hover:bg-red-950/40"
              >
                Ver todos <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
            <ul className="grid gap-3">
              {articles.map((article) => (
                <li key={article.slug}>
                  <Link
                    href={`/blog/${article.slug}`}
                    onClick={() => track("homepage_cta_click", { action: "article", placement: "content-card" })}
                    className="group flex min-h-28 items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-red-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-red-900"
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300">
                      <FileText size={20} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        <span>{article.category || "Artigo"}</span>
                        <span aria-hidden="true">·</span>
                        <span>{article.published}</span>
                        {article.readingTime > 0 && <><span aria-hidden="true">·</span><span>{article.readingTime} min de leitura</span></>}
                      </span>
                      <span className="mt-2 block font-bold text-slate-900 group-hover:text-red-700 dark:text-white dark:group-hover:text-red-300">
                        {article.title}
                      </span>
                      {article.excerpt && (
                        <span className="mt-1 line-clamp-2 block text-sm leading-6 text-slate-600 dark:text-slate-300">
                          {article.excerpt}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </section>
  );
}
