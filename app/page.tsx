import Link from "next/link";

import { getCmsContent } from "@/lib/public-cms";

export const metadata = {
  title: "Anderson Palafoz | Professor de Inglês",
  description: "Plataforma educacional completa com aulas, materiais exclusivos e conteúdo acadêmico de alta qualidade.",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const heroTitle = await getCmsContent("home", "hero_title", "Aprenda Inglês com Anderson Palafoz");
  const heroSubtitle = await getCmsContent("home", "hero_subtitle", "Plataforma educacional completa com aulas, materiais exclusivos e conteúdo acadêmico de alta qualidade.");
  const stat1Title = await getCmsContent("home", "stat_1_title", "100+");
  const stat1Desc = await getCmsContent("home", "stat_1_desc", "Aulas Disponíveis");
  const stat2Title = await getCmsContent("home", "stat_2_title", "A1–B2");
  const stat2Desc = await getCmsContent("home", "stat_2_desc", "Níveis das aulas");

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center py-20 px-4 md:px-8 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                {heroTitle}
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                {heroSubtitle}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/aulas">
                <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg rounded-lg font-semibold transition">
                  Começar Agora
                </button>
              </Link>
              <Link href="/sobre">
                <button className="border-2 border-gray-400 text-gray-700 px-8 py-3 text-lg rounded-lg font-semibold bg-white hover:bg-gray-50 hover:border-gray-500 transition">
                  Saiba Mais
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-8 pt-8">
              <div>
                <p className="text-3xl font-bold text-red-600">{stat1Title}</p>
                <p className="text-gray-600">{stat1Desc}</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-600">{stat2Title}</p>
                <p className="text-gray-600">{stat2Desc}</p>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="flex justify-center">
            <div className="w-full max-w-md aspect-square bg-red-100 rounded-3xl flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/principal.png"
                alt="Anderson Palafoz"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
