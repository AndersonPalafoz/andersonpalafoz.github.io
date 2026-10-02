import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, MessageSquareQuote } from "lucide-react";
import { GoogleReviewsSection } from "@/components/google-reviews-section";

export const metadata: Metadata = {
  title: "Depoimentos | Anderson Palafoz",
  description: "Veja as experiências de alunos que estudam inglês com Anderson Palafoz.",
};

export default function DepoimentosPage() {
  const googleProfileUrl =
    "https://www.google.com/search?q=Anderson+Palafoz+Google+Maps";

  return (
    <main className="min-h-screen bg-slate-50/70 dark:bg-slate-950">
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-white py-20 dark:border-slate-800 dark:bg-slate-900 sm:py-28">
        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-slate-200/70 blur-3xl dark:bg-slate-800/50" />
        <div className="page-container relative">
          <Link
            href="/"
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-600 transition hover:-translate-x-0.5 hover:border-red-300 hover:text-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-red-500 dark:hover:text-red-300"
          >
            <ArrowLeft size={15} /> Voltar para o início
          </Link>
          <div className="mt-10 grid max-w-5xl gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-red-600 dark:border-slate-700 dark:bg-slate-900 dark:text-red-300"><MessageSquareQuote size={15} aria-hidden="true" /> Prova social</span>
              <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900 sm:text-6xl dark:text-white">
                Aprendizado que deixa marcas positivas.
              </h1>
              <p className="mt-6 text-base leading-8 text-slate-600 dark:text-slate-300">
                Conheça relatos publicados por alunos e compartilhe também a sua experiência de estudar inglês com uma metodologia clara, prática e acolhedora.
              </p>
            </div>
            <a
              href={googleProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-red-600/20 transition hover:-translate-y-0.5 hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              Avaliar no Google <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white px-4 py-16 dark:border-slate-800 dark:bg-slate-950 sm:px-6 lg:px-16"><div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-red-600">O que vem depois</p><h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Quer construir sua própria evolução?</h2><p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">Conheça as aulas ou fale comigo para entender qual formato combina com seu objetivo.</p><div className="mt-6 flex flex-wrap gap-3"><Link href="/aulas" className="inline-flex min-h-11 items-center rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">Conhecer aulas</Link><Link href="/contato" className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-black text-slate-700 transition hover:border-red-300 hover:text-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 dark:border-slate-700 dark:text-slate-200">Falar comigo</Link></div></div><GoogleReviewsSection compact={false} limit={6} /></div></section>
    </main>
  );
}
