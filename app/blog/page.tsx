export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, User, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Blog | Anderson Palafoz",
  description: "Artigos, dicas e insights sobre ensino de inglês e educação.",
};

export default function BlogPage() {
  const artigos = [
    {
      id: 1,
      titulo: "10 Dicas para Melhorar sua Pronúncia em Inglês",
      descricao: "Técnicas práticas e eficazes para desenvolver uma pronúncia natural e clara.",
      autor: "Anderson Palafoz",
      data: "15 de Junho, 2024",
      categoria: "Pronúncia",
      slug: "10-dicas-pronuncia",
    },
    {
      id: 2,
      titulo: "Phrasal Verbs: Os Vilões do Inglês Intermediário",
      descricao: "Entenda como os phrasal verbs funcionam e domine-os com estratégias eficazes.",
      autor: "Anderson Palafoz",
      data: "12 de Junho, 2024",
      categoria: "Gramática",
      slug: "phrasal-verbs-intermediario",
    },
    {
      id: 3,
      titulo: "Metodologia ESA: O Segredo para Aulas Mais Eficazes",
      descricao: "Descubra como a metodologia ESA potencializa o aprendizado de inglês.",
      autor: "Anderson Palafoz",
      data: "8 de Junho, 2024",
      categoria: "Educação",
      slug: "metodologia-esa",
    },
    {
      id: 4,
      titulo: "Recursos Gratuitos para Praticar Inglês Online",
      descricao: "Uma lista completa de plataformas e ferramentas para aprimorar seu inglês.",
      autor: "Anderson Palafoz",
      data: "5 de Junho, 2024",
      categoria: "Recursos",
      slug: "recursos-gratuitos",
    },
    {
      id: 5,
      titulo: "A Importância da Educação Étnico-Racial no Ensino de Idiomas",
      descricao: "Como integrar representatividade e inclusão nas aulas de inglês.",
      autor: "Anderson Palafoz",
      data: "1 de Junho, 2024",
      categoria: "Educação",
      slug: "educacao-etnico-racial",
    },
    {
      id: 6,
      titulo: "Inteligência Artificial e Ensino de Inglês: O Futuro é Agora",
      descricao: "Explore como a IA está transformando o aprendizado de idiomas.",
      autor: "Anderson Palafoz",
      data: "28 de Maio, 2024",
      categoria: "Tecnologia",
      slug: "ia-ensino-ingles",
    },
  ];

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
              <Button className="bg-red-600 hover:bg-red-700 text-white px-8">
                Buscar
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categorias */}
      <section className="py-8 px-4 md:px-8 lg:px-16 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-3">
            {["Todos", "Pronúncia", "Gramática", "Educação", "Recursos", "Tecnologia"].map((cat) => (
              <button
                key={cat}
                className="px-6 py-2 rounded-full border border-gray-300 hover:border-red-600 hover:text-red-600 transition text-gray-700 font-medium"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Artigos */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {artigos.map((artigo) => (
              <Link key={artigo.id} href={`/blog/${artigo.slug}`}>
                <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 hover:border-red-600 hover:shadow-lg transition h-full flex flex-col cursor-pointer">
                  {/* Header */}
                  <div className="bg-red-600 text-white p-6 h-24 flex items-center">
                    <span className="text-sm font-semibold">{artigo.categoria}</span>
                  </div>

                  {/* Content */}
                  <div className="p-8 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {artigo.titulo}
                    </h3>
                    <p className="text-gray-600 text-sm mb-6 line-clamp-2 flex-1">
                      {artigo.descricao}
                    </p>

                    {/* Meta */}
                    <div className="space-y-3 border-t border-gray-200 pt-6">
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <User size={16} className="text-red-600" />
                        <span>{artigo.autor}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Calendar size={16} className="text-red-600" />
                        <span>{artigo.data}</span>
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
            <Button className="bg-white hover:bg-gray-100 text-red-600 font-semibold">
              Inscrever
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
