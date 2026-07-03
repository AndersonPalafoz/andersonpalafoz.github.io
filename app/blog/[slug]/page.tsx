"use client";

import { useParams } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";

export default function BlogPage() {
  const params = useParams();
  const slug = params.slug as string;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <Breadcrumbs
          items={[
            { label: "Blog", href: "/blog" },
            { label: slug, href: `/blog/${slug}` },
          ]}
        />

        <article className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">Artigo: {slug}</h1>

          <div className="text-gray-400 mb-8">
            <p>Publicado em: 3 de julho de 2024</p>
            <p>Autor: Anderson Palafoz</p>
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-lg text-gray-300 mb-6">
              Este é um artigo completo sobre ensino de inglês. Aqui você
              encontrará insights, metodologias e dicas práticas para melhorar
              suas aulas.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Introdução</h2>
            <p className="text-gray-300 mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Desenvolvimento</h2>
            <p className="text-gray-300 mb-4">
              Ut enim ad minim veniam, quis nostrud exercitation ullamco
              laboris nisi ut aliquip ex ea commodo consequat.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Conclusão</h2>
            <p className="text-gray-300">
              Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum dolore eu fugiat nulla pariatur.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800">
            <p className="text-gray-400">
              Gostou do artigo? Compartilhe com seus colegas!
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
