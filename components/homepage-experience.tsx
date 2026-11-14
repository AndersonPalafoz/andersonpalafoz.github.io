"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, BookOpen, GraduationCap, MessageCircle, X } from "lucide-react";

const services = [
  {
    icon: GraduationCap,
    title: "Aulas particulares",
    text: "Aulas organizadas em torno do seu nível, dos seus objetivos e da sua rotina.",
    href: "/contato",
    action: "Conversar sobre aulas",
  },
  {
    icon: BookOpen,
    title: "Cursos de inglês",
    text: "Percursos de aprendizagem para desenvolver o idioma com clareza e continuidade.",
    href: "/cursos",
    action: "Conhecer os cursos",
  },
  {
    icon: MessageCircle,
    title: "Materiais de estudo",
    text: "Atividades e recursos autorais para praticar também fora da aula.",
    href: "/materiais",
    action: "Explorar materiais",
  },
];

export function HomepageExperience() {
  const [cookieVisible, setCookieVisible] = useState(
    () => typeof document !== "undefined" && !document.cookie.split("; ").some((item) => item.startsWith("site-cookie-consent=")),
  );

  const closeCookies = (value: "accepted" | "dismissed") => {
    document.cookie = `site-cookie-consent=${value}; max-age=31536000; path=/; SameSite=Lax`;
    setCookieVisible(false);
  };

  return (
    <main className="homepage bg-white text-[#1f1f1f] dark:bg-slate-950 dark:text-slate-100">
      {cookieVisible && (
        <aside aria-labelledby="cookie-consent-title" className="border-b border-slate-200 bg-[#f8f9fa] dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
            <div>
              <p id="cookie-consent-title" className="text-sm font-semibold text-slate-900 dark:text-white">Sua privacidade importa</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Usamos cookies essenciais para o funcionamento do site.</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/privacidade" className="inline-flex min-h-11 items-center px-3 text-sm font-medium text-[#b91c1c] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600">Saiba mais</Link>
              <button type="button" aria-label="Fechar aviso de cookies" onClick={() => closeCookies("dismissed")} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 dark:hover:bg-slate-800">
                <X size={16} aria-hidden="true" />
              </button>
              <button type="button" onClick={() => closeCookies("accepted")} className="inline-flex min-h-11 items-center rounded-lg bg-[#d62828] px-4 text-sm font-semibold text-white hover:bg-[#b91c1c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2">
                Aceitar
              </button>
            </div>
          </div>
        </aside>
      )}

      <section className="border-b border-slate-200 bg-[#f8f9fa] dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_.9fr] lg:gap-20 lg:px-12 lg:py-24">
          <div className="max-w-2xl">
            <p className="mb-5 text-sm font-semibold text-[#b91c1c]">Anderson Palafoz <span className="px-1 text-slate-400">/</span> Professor de Inglês</p>
            <h1 className="max-w-[18.75rem] text-4xl font-semibold leading-[1.12] tracking-[-0.035em] text-slate-950 dark:text-white sm:max-w-none sm:text-5xl lg:text-[3.5rem]">
              Aprenda inglês com clareza, confiança e propósito.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg sm:leading-8">
              Sou licenciado em Letras Inglês pela UFBA. Crio aulas e materiais para ajudar você a desenvolver comunicação e avançar com um percurso bem estruturado.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/contato" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#d62828] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#b91c1c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2">
                Conversar sobre aulas <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link href="/cursos" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition-colors hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
                Conhecer os cursos
              </Link>
            </div>
          </div>

          <aside aria-label="Formação e abordagem de ensino" className="border-l-2 border-[#d62828] pl-6 sm:pl-8 lg:ml-auto lg:max-w-md">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Ensino de inglês, com atenção ao seu percurso</p>
            <dl className="mt-7 divide-y divide-slate-200 dark:divide-slate-800">
              <div className="py-5 first:pt-0">
                <dt className="text-sm font-semibold text-slate-950 dark:text-white">Formação</dt>
                <dd className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">Licenciatura em Letras Inglês pela Universidade Federal da Bahia.</dd>
              </div>
              <div className="py-5">
                <dt className="text-sm font-semibold text-slate-950 dark:text-white">Materiais autorais</dt>
                <dd className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">Recursos de estudo criados para apoiar a prática dentro e fora da aula.</dd>
              </div>
              <div className="py-5 last:pb-0">
                <dt className="text-sm font-semibold text-slate-950 dark:text-white">Foco na comunicação</dt>
                <dd className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">Aprendizagem conectada a objetivos e situações reais de uso do inglês.</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <section aria-labelledby="services-title" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-[#b91c1c]">Ensino e recursos</p>
          <h2 id="services-title" className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Como posso ajudar você?</h2>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">Escolha por onde começar. Você pode conhecer os cursos, estudar com materiais ou conversar sobre aulas.</p>
        </div>
        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {services.map(({ icon: Icon, title, text, href, action }) => (
            <article key={title} className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
              <Icon size={21} className="text-[#d62828]" aria-hidden="true" />
              <h3 className="mt-5 text-lg font-semibold text-slate-950 dark:text-white">{title}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
              <Link href={href} className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#b91c1c] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600">
                {action} <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="approach-title" className="border-y border-slate-200 bg-[#f8f9fa] dark:border-slate-800 dark:bg-slate-900/60">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 sm:py-16 lg:grid-cols-[.85fr_1.15fr] lg:items-start lg:gap-16 lg:px-12">
          <div>
            <p className="text-sm font-semibold text-[#b91c1c]">Uma forma clara de avançar</p>
            <h2 id="approach-title" className="mt-2 max-w-md text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Aprender é um percurso, não uma fórmula pronta.</h2>
          </div>
          <ol className="divide-y divide-slate-200 dark:divide-slate-800">
            <li className="flex gap-5 py-4 first:pt-0">
              <span className="text-sm font-semibold text-[#b91c1c]">01</span>
              <div><h3 className="text-base font-semibold text-slate-950 dark:text-white">Entenda seu ponto de partida</h3><p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">Seus objetivos, sua rotina e o que você já sabe orientam as próximas etapas.</p></div>
            </li>
            <li className="flex gap-5 py-4">
              <span className="text-sm font-semibold text-[#b91c1c]">02</span>
              <div><h3 className="text-base font-semibold text-slate-950 dark:text-white">Pratique com intenção</h3><p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">Aulas e materiais aproximam o estudo das situações em que você quer usar o inglês.</p></div>
            </li>
            <li className="flex gap-5 py-4 last:pb-0">
              <span className="text-sm font-semibold text-[#b91c1c]">03</span>
              <div><h3 className="text-base font-semibold text-slate-950 dark:text-white">Acompanhe seu progresso</h3><p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">Revise o que funcionou e ajuste o percurso conforme você avança.</p></div>
            </li>
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="flex flex-col gap-6 rounded-xl bg-[#1f1f1f] px-6 py-8 text-white sm:px-9 sm:py-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Vamos conversar sobre seus objetivos com o inglês?</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">Conte o que você procura e descubra qual caminho pode fazer sentido para você.</p>
          </div>
          <Link href="/contato" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1f1f1f]">
            Falar comigo <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
