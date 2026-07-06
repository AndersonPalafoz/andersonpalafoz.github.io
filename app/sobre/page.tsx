export const dynamic = "force-dynamic";

import Link from "next/link";
import { BookOpen, Award, Users, Lightbulb } from "lucide-react";

export const metadata = {
  title: "Sobre Anderson Palafoz | Ensino de Inglês",
  description:
    "Conheça a história, formação e filosofia de ensino de Anderson Palafoz.",
};

export default function SobrePage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center py-20 px-4 md:px-8 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Sobre
                <br />
                <span className="text-red-600">Anderson Palafoz</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Professor de inglês dedicado ao ensino de alta qualidade, com formação em Letras-Inglês pela UFBA e experiência em educação com foco étnico-racial e inclusão.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-8 pt-8">
              <div>
                <p className="text-3xl font-bold text-red-600">10+</p>
                <p className="text-gray-600">Anos de Experiência</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-600">500+</p>
                <p className="text-gray-600">Alunos Formados</p>
              </div>
            </div>
          </div>

          {/* Right Image Placeholder */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="w-full h-96 bg-gradient-to-br from-red-100 to-red-50 rounded-3xl flex items-center justify-center shadow-lg">
              <svg
                width="200"
                height="200"
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="opacity-80"
              >
                {/* Person icon */}
                <circle cx="100" cy="60" r="30" stroke="#D62828" strokeWidth="3" fill="none" />
                <path
                  d="M70 100C70 85 85 75 100 75C115 75 130 85 130 100V160H70V100Z"
                  stroke="#D62828"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Formação Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Formação Acadêmica
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Licenciatura em Letras-Inglês
                  </h3>
                  <p className="text-gray-600">
                    Universidade Federal da Bahia (UFBA) - Formação completa em ensino de inglês e linguística aplicada.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Pesquisa em Linguística
                  </h3>
                  <p className="text-gray-600">
                    Especialização em Morfologia e Sintaxe, com foco em educação étnico-racial e inclusão.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filosofia de Ensino */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Filosofia de Ensino
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Lightbulb,
                title: "Estruturado",
                description: "Aulas planejadas com objetivos claros e progressão lógica.",
              },
              {
                icon: Users,
                title: "Centrado no Aluno",
                description: "Metodologia ESA (Engage, Study, Activate) adaptada para cada aluno.",
              },
              {
                icon: BookOpen,
                title: "Prático",
                description: "Foco em aplicação real da língua em contextos autênticos.",
              },
              {
                icon: Award,
                title: "Inclusivo",
                description: "Educação com foco étnico-racial e respeito à diversidade.",
              },
            ].map((item, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-2xl border border-gray-200">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <item.icon className="text-red-600" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Áreas de Atuação */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Áreas de Atuação
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              "Ensino de Inglês (A1-C2)",
              "Linguística Aplicada",
              "Produção de Materiais Didáticos",
              "Educação com Foco Étnico-Racial",
              "Tecnologia e IA em Educação",
              "Formação de Professores",
            ].map((area) => (
              <div
                key={area}
                className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-red-600 hover:shadow-lg transition"
              >
                <p className="font-semibold text-gray-900">{area}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-red-600">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Pronto para Começar sua Jornada?
          </h2>
          <p className="text-lg text-red-100">
            Explore meus cursos, materiais e conteúdos educacionais de alta qualidade.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/aulas">
              <button className="bg-white hover:bg-gray-100 text-red-600 px-8 py-6 text-lg rounded-lg font-semibold">
                Ver Aulas
              </button>
            </Link>
            <Link href="/materiais">
              <button className="bg-red-700 hover:bg-red-800 text-white px-8 py-6 text-lg rounded-lg font-semibold">
                Explorar Materiais
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
