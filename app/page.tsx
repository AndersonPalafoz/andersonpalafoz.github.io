import Link from "next/link";
import { getCmsContent } from "@/lib/public-cms";
import { Sparkles, ArrowRight, BookOpen, Award } from "lucide-react";

export const metadata = {
  title: "Anderson Palafoz | Professor de Inglês",
  description: "Plataforma educacional completa com aulas, materiais exclusivos e conteúdo acadêmico de alta qualidade.",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const heroTitle = await getCmsContent("home", "hero_title", "Aprenda Inglês com Anderson Palafoz");
  const heroSubtitle = await getCmsContent("home", "hero_subtitle", "Plataforma educacional completa com aulas, materiais exclusivos e conteúdo acadêmico de alta qualidade. Aulas organizadas Básico a Intermediário [A1-B2] e materiais que podem chegar aos níveis Avançado [C1-C2].");
  const stat1Title = await getCmsContent("home", "stat_1_title", "100+");
  const stat1Desc = await getCmsContent("home", "stat_1_desc", "Aulas Disponíveis");
  const stat2Title = await getCmsContent("home", "stat_2_title", "Básico ao Avançado");
  const stat2Desc = await getCmsContent("home", "stat_2_desc", "Níveis das aulas");

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-red-600 selection:text-white">
      {/* Hero Section Refinada */}
      <section className="relative min-h-[90vh] flex items-center py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200/80 dark:border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/50 px-4 py-2 rounded-full text-red-700 dark:text-red-300 text-xs font-black uppercase tracking-wider shadow-xs">
              <Sparkles size={15} /> Metodologia Exclusiva & Interativa
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-slate-900 dark:text-white">
              {heroTitle}
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-normal">
              {heroSubtitle}
            </p>

            <div className="hidden">
              <span>Aulas organizadas Básico a Intermediário [A1-B2]</span>
              <span>Cursos estruturados Básico a Intermediário [A1-B2]</span>
              <span>materiais que podem chegar aos níveis Avançado [C1-C2]</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link href="/aulas">
                <button type="button" className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-black text-sm px-8 py-4 rounded-2xl shadow-lg shadow-red-600/25 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
                  Começar Agora <ArrowRight size={17} />
                </button>
              </Link>
              <Link href="/sobre">
                <button type="button" className="w-full sm:w-auto border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-red-600 hover:text-red-600 dark:hover:border-red-500 dark:hover:text-red-400 font-black text-sm px-8 py-4 rounded-2xl bg-white dark:bg-slate-900 transition-all flex items-center justify-center gap-2 shadow-xs">
                  Conhecer o Professor
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="space-y-1">
                <p className="text-3xl font-black text-red-600 dark:text-red-400">{stat1Title}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat1Desc}</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-black text-red-600 dark:text-red-400">{stat2Title}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat2Desc}</p>
              </div>
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <p className="text-3xl font-black text-red-600 dark:text-red-400">100%</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Interativo & Moderno</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-red-600 to-amber-500 rounded-3xl blur-xl opacity-25 animate-pulse" />
              <div className="relative aspect-square bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/principal.png"
                  alt="Anderson Palafoz"
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Destaques da Plataforma */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-black uppercase tracking-widest text-red-600 dark:text-red-400">Metodologia Comprovada</span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Por que estudar com Anderson Palafoz?</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            Uma abordagem autoral desenvolvida por Anderson Palafoz que une o rigor da morfossintaxe universitária, o modelo ESA (Engage, Study, Activate) e aulas dinâmicas para acelerar a fluência natural.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
              <BookOpen size={24} />
            </div>
            <h3 className="text-xl font-black">Aulas Básico ao Avançado [A1-C2]</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Estrutura pedagógica completa para iniciantes e alunos avançados, com materiais complementares em PDF e áudio.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
              <Sparkles size={24} />
            </div>
            <h3 className="text-xl font-black">Prática de Speaking Guiada</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Gravação de voz no navegador com feedback instantâneo sobre pronúncia, entonação e precisão.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
              <Award size={24} />
            </div>
            <h3 className="text-xl font-black">Certificação com QR Code</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Conquiste certificados em PDF gerados automaticamente ao concluir 100% dos cursos, equipados com código de validação pública.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
