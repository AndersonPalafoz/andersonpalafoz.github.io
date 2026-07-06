"use client";

import { useParams } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";

export default function MaterialPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <Breadcrumbs
          items={[
            { label: "Materiais", href: "/materiais" },
            { label: `Material ${id}`, href: `/materiais/${id}` },
          ]}
        />

        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">Material {id}</h1>
          <p className="text-gray-400 mb-8">
            Este é um material educacional completo. Você pode visualizar,
            fazer download e utilizar em suas aulas.
          </p>

          <div className="bg-gray-900 p-8 rounded-lg mb-8">
            <h2 className="text-2xl font-bold mb-4">Informações do Material</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-400">Tipo:</p>
                <p className="font-bold">Worksheet</p>
              </div>
              <div>
                <p className="text-gray-400">Nível:</p>
                <p className="font-bold">A1 - Iniciante</p>
              </div>
              <div>
                <p className="text-gray-400">Tamanho:</p>
                <p className="font-bold">2.5 MB</p>
              </div>
            </div>
          </div>

          <button className="bg-red-600 hover:bg-red-700">
            Fazer Download
          </button>
        </div>
      </div>
    </div>
  );
}
