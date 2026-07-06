"use client";

import { useParams } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";

export default function CoursePage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <Breadcrumbs
          items={[
            { label: "Aulas", href: "/aulas" },
            { label: `Curso ${id}`, href: `/cursos/${id}` },
          ]}
        />

        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">Detalhes do Curso {id}</h1>
          <p className="text-gray-400 mb-8">
            Esta é a página de detalhes do curso. Aqui você pode ver informações
            completas sobre o curso, módulos, aulas e muito mais.
          </p>

          <div className="bg-gray-900 p-8 rounded-lg mb-8">
            <h2 className="text-2xl font-bold mb-4">Módulos do Curso</h2>
            <ul className="space-y-4">
              <li className="flex items-center">
                <span className="text-red-500 mr-3">✓</span>
                <span>Módulo 1: Introdução</span>
              </li>
              <li className="flex items-center">
                <span className="text-red-500 mr-3">✓</span>
                <span>Módulo 2: Conceitos Básicos</span>
              </li>
              <li className="flex items-center">
                <span className="text-red-500 mr-3">✓</span>
                <span>Módulo 3: Prática Avançada</span>
              </li>
            </ul>
          </div>

          <button className="bg-red-600 hover:bg-red-700">
            Inscrever-se no Curso
          </button>
        </div>
      </div>
    </div>
  );
}
