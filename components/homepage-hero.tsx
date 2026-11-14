import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const heroImage = "/english-lesson-banner.png";

export function HomepageHero() {
  return (
    <section aria-labelledby="homepage-hero-title" className="bg-white px-5 py-6 dark:bg-slate-950 sm:px-8 sm:py-8 lg:px-12">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-xl bg-[#c8102e] text-white">
        <div className="grid lg:min-h-[450px] lg:grid-cols-[0.92fr_1.08fr]">
          <div className="order-2 flex flex-col items-start justify-center px-6 py-9 sm:px-10 sm:py-11 lg:order-1 lg:px-12 lg:py-14">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.16em] text-white/80 sm:text-sm">
              Aulas de inglês com Anderson Palafoz
            </p>
            <h1 id="homepage-hero-title" className="max-w-xl text-4xl font-black leading-[1.04] tracking-tight text-white sm:text-5xl lg:text-[3.75rem]">
              Inglês para falar com confiança.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/90 sm:text-lg sm:leading-8">
              Aulas e materiais autorais para você avançar com clareza e usar o inglês na vida real.
            </p>
            <Link
              href="/cursos"
              className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#ffffff] px-5 text-sm font-bold text-[#b5122b] transition-colors hover:bg-[#fef2f2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#c8102e]"
            >
              Conheça os cursos
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <p className="mt-5 text-sm font-medium text-white/75">Do básico ao avançado · A1–C2</p>
          </div>

          <div className="relative order-1 aspect-[16/9] overflow-hidden bg-red-950 lg:order-2 lg:aspect-auto lg:min-h-[450px]">
            <Image
              src={heroImage}
              alt="Cena ilustrativa de alunos adultos praticando inglês em uma sala de aula"
              fill
              sizes="(max-width: 1023px) 100vw, 58vw"
              preload
              className="object-cover object-[75%_center]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
