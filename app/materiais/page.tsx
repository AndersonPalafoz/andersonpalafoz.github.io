export const dynamic = "force-dynamic";

import Link from "next/link";
import { Download, FileText, BookOpen, Zap, Headphones, PenTool } from "lucide-react";
import { getMaterials } from "@/lib/db";

export const metadata = {
  title: "Materiais Didáticos | Anderson Palafoz",
  description: "Acesse uma biblioteca completa de materiais didáticos para ensino de inglês.",
};

const CATEGORY_ICONS: Record<string, typeof FileText> = {
  Worksheets: FileText,
  Slides: PenTool,
  Áudios: Headphones,
  Exercícios: Zap,
  Artigos: BookOpen,
};

export default async function MateriaisPage() {
  const materiais = await getMaterials();

  const niveis = Array.from(new Set(materiais.map((m) => m.level))).sort();
  const nivelRange = niveis.length > 0 ? `${niveis[0]}-${niveis[niveis.length - 1]}` : "A1-C2";

  const categorias = Object.entries(
    materiais.reduce<Record<string, number>>((acc, m) => {
      acc[m.category] = (acc[m.category] ?? 0) + 1;
      return acc;
    }, {})
  );

  const destaques = [...materiais]
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 4);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center py-20 px-4 md:px-8 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto w-full">
          <div className="space-y-8 max-w-3xl">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Materiais
                <br />
                <span className="text-red-600">Didáticos Exclusivos</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Biblioteca completa com worksheets, guias, recursos interativos e templates para potencializar seu aprendizado.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div>
                <p className="text-3xl font-bold text-red-600">{materiais.length}</p>
                <p className="text-gray-600 text-sm">Recursos</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-600">{nivelRange}</p>
                <p className="text-gray-600 text-sm">Todos os Níveis</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-600">100%</p>
                <p className="text-gray-600 text-sm">Atualizado</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorias */}
      {categorias.length > 0 && (
        <section className="py-20 px-4 md:px-8 lg:px-16 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
              Categorias de Materiais
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {categorias.map(([categoria, quantidade]) => {
                const Icon = CATEGORY_ICONS[categoria] || FileText;
                return (
                  <div
                    key={categoria}
                    className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:border-red-600 hover:shadow-lg transition"
                  >
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="text-red-600" size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{categoria}</h3>
                    <p className="text-2xl font-bold text-red-600">{quantidade}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Destaques */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Materiais em Destaque
          </h2>

          {destaques.length === 0 ? (
            <p className="text-center text-gray-600">
              Nenhum material publicado no momento. Volte em breve!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {destaques.map((material) => (
                <div
                  key={material.id}
                  className="bg-gray-50 p-8 rounded-2xl border border-gray-200 hover:border-red-600 hover:shadow-lg transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 flex-1">
                      {material.title}
                    </h3>
                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold ml-4 flex-shrink-0">
                      {material.level}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-6">
                    {material.description || material.category}
                  </p>
                  <Link href={`/materiais/${material.id}`}>
                    <button className="w-full bg-red-600 hover:bg-red-700 text-white inline-flex items-center justify-center gap-2">
                      <Download size={18} />
                      Ver Material
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Por que usar nossos materiais?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                titulo: "Estruturados",
                descricao: "Organizados por nível e tema para facilitar o aprendizado progressivo",
              },
              {
                titulo: "Atualizados",
                descricao: "Conteúdo constantemente revisado e melhorado com base em feedback",
              },
              {
                titulo: "Práticos",
                descricao: "Foco em aplicação real com exemplos autênticos do inglês moderno",
              },
              {
                titulo: "Diversificados",
                descricao: "Diferentes formatos e tipos de atividades para todos os estilos de aprendizado",
              },
              {
                titulo: "Acessíveis",
                descricao: "Disponíveis em múltiplos formatos para facilitar o acesso",
              },
              {
                titulo: "Completos",
                descricao: "Cobertura abrangente de todos os aspectos do idioma",
              },
            ].map((beneficio, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {beneficio.titulo}
                </h3>
                <p className="text-gray-600">{beneficio.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-red-600">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Acesse Todos os Materiais
          </h2>
          <p className="text-lg text-red-100">
            Inscreva-se agora e tenha acesso completo à nossa biblioteca de recursos.
          </p>
          <Link href="/dashboard">
            <button className="bg-white hover:bg-gray-100 text-red-600 px-8 py-6 text-lg rounded-lg font-semibold">
              Acessar Biblioteca
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
