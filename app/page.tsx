export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, BookOpen, Users, Award } from "lucide-react";
import Image from "next/image";

export const metadata = {
  title: "Anderson Palafoz | Professor de Inglês",
  description: "Plataforma educacional completa com aulas, materiais exclusivos e conteúdo acadêmico de alta qualidade.",
};

export default function HomePage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center py-20 px-4 md:px-8 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Aprenda Inglês com
                <br />
                <span className="text-red-600">Anderson Palafoz</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Plataforma educacional completa com aulas, materiais exclusivos e conteúdo acadêmico de alta qualidade.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/aulas">
                <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg rounded-lg font-semibold">
                  Começar Agora
                </Button>
              </Link>
              <Link href="/sobre">
                <Button className="border-2 border-gray-400 text-gray-700 px-8 py-6 text-lg rounded-lg font-semibold bg-white hover:bg-gray-50 hover:border-gray-500">
                  Saiba Mais
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-8 pt-8">
              <div>
                <p className="text-3xl font-bold text-red-600">100+</p>
                <p className="text-gray-600">Aulas Disponíveis</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-600">A1-C2</p>
                <p className="text-gray-600">Todos os Níveis CEFR</p>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="flex justify-center">
            <div className="w-full max-w-md aspect-square bg-red-100 rounded-3xl flex items-center justify-center overflow-hidden">
              <Image src="/logo-principal.png" alt="Anderson Palafoz" width={400} height={400} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Credibilidade Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Por que Escolher Anderson Palafoz?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="text-red-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Conteúdo Estruturado</h3>
              <p className="text-gray-600">Aulas organizadas por nível CEFR com metodologia ESA (Engage, Study, Activate)</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-red-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Experiência Comprovada</h3>
              <p className="text-gray-600">Professor com formação em Letras-Inglês pela UFBA e experiência em educação inclusiva</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-red-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Materiais Exclusivos</h3>
              <p className="text-gray-600">Worksheets, slides, artigos e recursos pedagógicos de alta qualidade</p>
            </div>
          </div>
        </div>
      </section>

      {/* Serviços Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Nossos Serviços</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Cursos Online</h3>
              <p className="text-gray-600 mb-6">Cursos estruturados de A1 a C2 com vídeos, exercícios e materiais complementares.</p>
              <Link href="/aulas" className="inline-flex items-center gap-2 text-red-600 font-semibold hover:text-red-700">
                Explorar Cursos <ArrowRight size={18} />
              </Link>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Materiais Educacionais</h3>
              <p className="text-gray-600 mb-6">Worksheets, slides, áudios e recursos para potencializar seu aprendizado.</p>
              <Link href="/materiais" className="inline-flex items-center gap-2 text-red-600 font-semibold hover:text-red-700">
                Ver Materiais <ArrowRight size={18} />
              </Link>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Blog e Artigos</h3>
              <p className="text-gray-600 mb-6">Dicas, insights e reflexões sobre ensino de inglês e educação.</p>
              <Link href="/blog" className="inline-flex items-center gap-2 text-red-600 font-semibold hover:text-red-700">
                Ler Blog <ArrowRight size={18} />
              </Link>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Suporte Personalizado</h3>
              <p className="text-gray-600 mb-6">Dúvidas? Entre em contato para suporte e orientações personalizadas.</p>
              <Link href="/contato" className="inline-flex items-center gap-2 text-red-600 font-semibold hover:text-red-700">
                Entre em Contato <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Diferenciais Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">O que torna esta experiência diferente?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Materiais Autorais",
                description: "Conteúdo exclusivo desenvolvido especificamente para suas necessidades",
              },
              {
                title: "Ensino Estruturado",
                description: "Metodologia clara e progressiva baseada em melhores práticas",
              },
              {
                title: "Acompanhamento Próximo",
                description: "Feedback personalizado e suporte contínuo no seu aprendizado",
              },
              {
                title: "Aprendizagem Prática",
                description: "Foco em comunicação real e aplicação prática do idioma",
              },
            ].map((item, index) => (
              <div key={index} className="p-8 bg-white rounded-lg border border-gray-200">
                <h3 className="text-2xl font-bold text-red-600 mb-4">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-lg">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-red-600">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Pronto para Começar sua Jornada?
          </h2>
          <p className="text-lg text-red-100">
            Inscreva-se agora e tenha acesso a todos os nossos cursos e materiais exclusivos.
          </p>
          <Link href="/aulas">
            <Button className="bg-white hover:bg-gray-100 text-red-600 px-8 py-6 text-lg rounded-lg font-semibold">
              Começar Agora
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
