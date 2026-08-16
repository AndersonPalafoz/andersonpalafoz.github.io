export const dynamic = "force-dynamic";

import Link from "next/link";
import { Calendar, User, ArrowRight } from "lucide-react";
import { getPublicArticles } from "@/lib/public-content";

export const metadata = {
  title: "Blog | Anderson Palafoz",
  description: "Artigos, dicas e insights sobre ensino de inglês e educação.",
};

export default async function BlogPage() {
  const { articles: todosArtigos, available: artigosDisponiveis } =
    await getPublicArticles();
  // Rascunhos (published == null) nao aparecem na listagem publica
  const artigos = todosArtigos.filter((a) => a.published);

  const categorias = Array.from(
    new Set(artigos.map((a) => a.category).filter((c): c is string => !!c))
  );

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center py-20 px-4 md:px-8 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto w-full">
          <div className="space-y-8 max-w-3xl">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Blog de
                <br />
                <span className="text-red-600">Inglês e Educação</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Artigos, dicas, insights e reflexões sobre ensino de inglês, linguística, educação e tecnologia.
              </p>
            </div>

            {/* Search */}
            <div className="flex gap-4 pt-8">
              <input
                type="text"
                placeholder="Buscar artigos..."
                className="flex-1 px-6 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-red-600"
              />
              <button className="bg-red-600 hover:bg-red-700 text-white px-8">
                Buscar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categorias */}
      {categorias.length > 0 && (
        <section className="py-8 px-4 md:px-8 lg:px-16 bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-3">
              {["Todos", ...categorias].map((cat) => (
                <span
                  key={cat}
                  className="px-6 py-2 rounded-full border border-gray-300 text-gray-700 font-medium"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Artigos */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          {!artigosDisponiveis ? (
            <div className="mx-auto max-w-2xl rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
              <h2 className="text-xl font-bold text-gray-900">Conteúdo temporariamente indisponível</h2>
              <p className="mt-3 text-gray-600">
                Estamos atualizando o blog. Tente novamente em alguns instantes.
              </p>
            </div>
          ) : artigos.length === 0 ? (
            <p className="text-center text-gray-600">
              Nenhum artigo publicado no momento. Volte em breve!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {artigos.map((artigo) => (
                <Link key={artigo.id} href={`/blog/${artigo.slug}`}>
                  <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 hover:border-red-600 hover:shadow-lg transition h-full flex flex-col cursor-pointer">
                    {/* Header */}
                    <div className="bg-red-600 text-white p-6 h-24 flex items-center">
                      <span className="text-sm font-semibold">
                        {artigo.category || "Blog"}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-8 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                        {artigo.title}
                      </h3>
                      {artigo.content && (
                        <p className="text-gray-600 text-sm mb-6 line-clamp-2 flex-1">
                          {artigo.content}
                        </p>
                      )}

                      {/* Meta */}
                      <div className="space-y-3 border-t border-gray-200 pt-6">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <User size={16} className="text-red-600" />
                          <span>Anderson Palafoz</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Calendar size={16} className="text-red-600" />
                          <span>
                            {new Date(artigo.published!).toLocaleDateString("pt-BR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="p-8 pt-0">
                      <div className="flex items-center gap-2 text-red-600 font-semibold">
                        Ler Mais
                        <ArrowRight size={18} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-red-600">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Receba Novos Artigos
          </h2>
          <p className="text-lg text-red-100">
            Inscreva-se em nossa newsletter e receba dicas e insights sobre inglês e educação diretamente no seu email.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Seu email"
              className="flex-1 px-6 py-3 rounded-lg focus:outline-none"
            />
            <button className="bg-white hover:bg-gray-100 text-red-600 font-semibold">
              Inscrever
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
