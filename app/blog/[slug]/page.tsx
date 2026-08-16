export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getArticleBySlug } from "@/lib/db";
import { Calendar, Clock } from "lucide-react";

async function ArticleDetail({ slug }: { slug: string }) {
  const article = await getArticleBySlug(slug);

  // Rascunhos (published == null) nao ficam visiveis publicamente
  if (!article || !article.published) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Artigo não encontrado.</p>
      </div>
    );
  }

  const publishedDate = new Date(article.published).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="container mx-auto px-4 py-12">
        <Breadcrumbs
          items={[
            { label: "Blog", href: "/blog" },
            { label: article.title, href: `/blog/${article.slug}` },
          ]}
        />

        <article className="max-w-3xl">
          {article.category && (
            <span className="inline-block bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold mb-4">
              {article.category}
            </span>
          )}

          <h1 className="text-4xl font-bold mb-4 text-gray-900">{article.title}</h1>

          <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8 text-sm">
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
          </div>

          <div className="prose prose-slate max-w-none text-gray-700 whitespace-pre-wrap">
            {article.content}
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-500">
              Gostou do artigo? Compartilhe com seus colegas!
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-gray-600">Carregando artigo...</p>
        </div>
      }
    >
      <ArticleDetail slug={slug} />
    </Suspense>
  );
}
