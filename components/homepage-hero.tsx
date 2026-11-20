"use client";

import Image from "next/image";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { ArrowRight, MessageCircle } from "lucide-react";
import { CONTACT_WHATSAPP_HOMEPAGE_URL } from "@/lib/contact";

const heroImage = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image.png-DHzkUiPGb3OUjAUkPWCLcSA2y2n0jv.webp";

export function HomepageHero({ title }: { title: string }) {
  return (
    <section aria-labelledby="homepage-hero-title" className="bg-white px-5 py-6 dark:bg-slate-950 sm:px-8 sm:py-8 lg:px-12">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-xl bg-[#D62828] text-white">
        <div className="grid min-[900px]:min-h-[450px] min-[900px]:grid-cols-[0.92fr_1.08fr]">
          <div className="order-2 flex flex-col items-start justify-center px-6 py-9 sm:px-10 sm:py-11 min-[900px]:order-1 min-[900px]:px-12 min-[900px]:py-8">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.16em] text-white/80 sm:text-sm">
              Aulas de inglês com Anderson Palafoz
            </p>
            <h1 id="homepage-hero-title" className="max-w-xl text-4xl font-black leading-[1.04] tracking-tight text-white sm:text-5xl min-[900px]:text-[2.5rem] min-[1280px]:text-[3.75rem]">
              {title}
            </h1>
<p className="mt-5 max-w-lg text-base leading-7 text-white/90 sm:text-lg sm:leading-8">
              Aulas e materiais autorais com orientação direta, conectados aos seus objetivos e à sua rotina.
            </p>
            <div className="mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <a
                href={CONTACT_WHATSAPP_HOMEPAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("homepage_cta_click", { action: "whatsapp", placement: "hero" })}
                className="homepage-hero-primary-cta inline-flex min-h-12 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-white px-3 text-sm font-bold text-[#B91C1C] transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#D62828]"
              >
                Fale no WhatsApp
                <MessageCircle size={17} aria-hidden="true" />
              </a>
              <Link
                href="/cursos"
                onClick={() => track("homepage_cta_click", { action: "courses", placement: "hero" })}
                className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-white/70 px-3 text-sm font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#D62828]"
              >
                Ver cursos
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="relative order-1 aspect-[16/9] overflow-hidden bg-red-950 min-[900px]:order-2 min-[900px]:aspect-auto min-[900px]:min-h-[450px]">
            <Image
              src={heroImage}
              alt="Fotografia pessoal de Anderson Palafoz, sorrindo e usando terno azul-marinho"
              fill
              sizes="(max-width: 899px) 100vw, 58vw"
              preload
              className="object-cover object-[75%_center]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
