export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
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
                Plataforma educacional completa com aulas, materiais exclusivos e
                conteúdo acadêmico de alta qualidade.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard">
                <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg rounded-lg">
                  Começar Agora
                </Button>
              </Link>
              <Link href="/sobre">
                <Button
                  variant="outline"
                  className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-6 text-lg rounded-lg"
                >
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

          {/* Right Image Placeholder */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="w-full h-96 bg-gradient-to-br from-red-100 to-red-50 rounded-3xl flex items-center justify-center shadow-lg">
              <Image
                src="/manus-storage/principal_af851105.png"
                alt="Anderson Palafoz"
                width={300}
                height={300}
                className="w-64 h-64 object-contain opacity-80"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Credibilidade Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Por que estudar comigo?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Formação",
                description: "Licenciado em Letras Inglês pela UFBA",
              },
              {
                title: "Experiência",
                description: "Experiência com jovens e adultos",
              },
              {
                title: "Materiais Autorais",
                description: "Produção de materiais próprios",
              },
              {
                title: "Acompanhamento",
                description: "Projetos educacionais e pesquisa acadêmica",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="p-6 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition"
              >
                <h3 className="text-xl font-bold text-red-600 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Serviços Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Como posso ajudar você?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              "Aulas Particulares",
              "Cursos Online",
              "Materiais de Estudo",
              "Mentoria de Aprendizagem",
            ].map((service, index) => (
              <div
                key={index}
                className="p-8 bg-gradient-to-br from-red-50 to-white border border-red-100 rounded-lg hover:shadow-lg transition text-center"
              >
                <h3 className="text-xl font-bold text-gray-900">{service}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diferenciais Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            O que torna esta experiência diferente?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Materiais Autorais",
                description:
                  "Conteúdo exclusivo desenvolvido especificamente para suas necessidades",
              },
              {
                title: "Ensino Estruturado",
                description:
                  "Metodologia clara e progressiva baseada em melhores práticas",
              },
              {
                title: "Acompanhamento Próximo",
                description:
                  "Feedback personalizado e suporte contínuo no seu aprendizado",
              },
              {
                title: "Aprendizagem Prática",
                description:
                  "Foco em comunicação real e aplicação prática do idioma",
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

      {/* Materiais em Destaque */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Materiais em Destaque
          </h2>
          <p className="text-center text-gray-600 text-lg mb-16 max-w-2xl mx-auto">
            Demonstre valor antes da venda. Acesse worksheets, guias e recursos
            gratuitos.
          </p>

          <div className="text-center">
            <Link href="/materiais">
              <Button className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg rounded-lg">
                Explorar Materiais
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-r from-red-600 to-red-700">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Vamos conversar sobre seus objetivos com o inglês?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contato">
              <Button className="bg-white text-red-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-lg font-bold">
                Falar no WhatsApp
              </Button>
            </Link>
            <Link href="/aulas">
              <Button
                variant="outline"
                className="border-2 border-white text-white hover:bg-red-600 px-8 py-6 text-lg rounded-lg"
              >
                Explorar Cursos
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
