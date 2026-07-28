export const dynamic = "force-dynamic";

import Link from "next/link";
import { Clock, Users, Award, BookOpen, Layers, ArrowRight } from "lucide-react";
import { getCourses } from "@/lib/db";

export const metadata = {
  title: "Aulas de Inglês | Anderson Palafoz",
  description: "Explore as aulas de inglês de Anderson Palafoz, com cursos de A1 a C2.",
};

const LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"];

export default async function AulasPage() {
  const cursosDb = await getCourses();
  const cursos = [...cursosDb].sort(
    (a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level)
  );
  const totalModulos = cursos.reduce((sum, c) => sum + (c.modules ?? 0), 0);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center py-20 px-4 md:px-8 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto w-full">
          <div className="space-y-8 max-w-3xl">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Aulas de
                <br />
                <span className="text-red-600">Inglês Completas</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Cursos estruturados de A1 a C2, com metodologia ESA (Engage, Study, Activate) e foco em comunicação prática.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div>
                <p className="text-3xl font-bold text-red-600">{cursos.length}</p>
                <p className="text-gray-600 text-sm">Cursos Disponíveis</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-600">{totalModulos}</p>
                <p className="text-gray-600 text-sm">Módulos ao Todo</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-600">100%</p>
                <p className="text-gray-600 text-sm">Prático</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            O que você vai aprender
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: BookOpen,
                title: "Gramática",
                description: "Estruturas essenciais com foco em aplicação prática",
              },
              {
                icon: Users,
                title: "Conversação",
                description: "Comunicação fluida em situações reais",
              },
              {
                icon: Clock,
                title: "Pronúncia",
                description: "Sotaque natural e compreensão auditiva",
              },
              {
                icon: Award,
                title: "Certificação",
                description: "Certificado ao final de cada nível",
              },
            ].map((item, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
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

      {/* Cursos */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Nossos Cursos
          </h2>

          {cursos.length === 0 ? (
            <p className="text-center text-gray-600">
              Nenhum curso publicado no momento. Volte em breve!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cursos.map((curso) => (
                <div
                  key={curso.id}
                  className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 hover:border-red-600 hover:shadow-lg transition flex flex-col"
                >
                  <div className="bg-red-600 text-white p-6">
                    <div className="text-4xl font-bold mb-2">{curso.level}</div>
                    <h3 className="text-2xl font-bold">{curso.title}</h3>
                  </div>
                  <div className="p-8 space-y-6 flex-1 flex flex-col">
                    <p className="text-gray-600 flex-1">
                      {curso.description || "Curso estruturado de inglês com metodologia ESA."}
                    </p>

                    <div className="flex items-center gap-3 text-gray-700">
                      <Layers size={18} className="text-red-600" />
                      <span>{curso.modules ?? 0} módulos</span>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <Link href={`/cursos/${curso.id}`}>
                        <button className="w-full bg-red-600 hover:bg-red-700 text-white inline-flex items-center justify-center gap-2">
                          Ver Curso <ArrowRight size={18} />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-red-600">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Comece sua Transformação Hoje
          </h2>
          <p className="text-lg text-red-100">
            Escolha seu nível e inicie sua jornada rumo à fluência em inglês.
          </p>
          <Link href="/dashboard">
            <button className="bg-white hover:bg-gray-100 text-red-600 px-8 py-6 text-lg rounded-lg font-semibold">
              Explorar Cursos
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
