"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, Check, ChevronLeft, ChevronRight, GraduationCap, Menu, MessageCircle, Play, Sparkles, X } from "lucide-react";
import { GoogleReviewsSection } from "@/components/google-reviews-section";

const slides = [
  { eyebrow: "Aprendizagem com propósito", title: "Inglês para usar no mundo real.", text: "Uma jornada clara, humana e estruturada para você desenvolver confiança em cada etapa.", cta: "Conhecer os cursos", href: "/cursos", accent: "from-red-700 via-red-600 to-red-500" },
  { eyebrow: "Conteúdo autoral", title: "Estude com materiais feitos para você.", text: "Aulas, guias e práticas organizadas para transformar estudo em progresso perceptível.", cta: "Explorar materiais", href: "/materiais", accent: "from-slate-900 via-slate-800 to-red-900" },
  { eyebrow: "Acompanhamento próximo", title: "Seu próximo passo começa agora.", text: "Encontre uma experiência de aprendizagem que respeita seu ritmo e seus objetivos.", cta: "Falar com Anderson", href: "/contato", accent: "from-red-800 via-red-700 to-slate-700" },
];

const highlights = [
  { icon: GraduationCap, title: "Percurso estruturado", text: "Do básico ao avançado, com objetivos visíveis e materiais que acompanham seu desenvolvimento." },
  { icon: BookOpen, title: "Materiais autorais", text: "Worksheets, guias e atividades produzidos para tornar o inglês mais claro e aplicável." },
  { icon: MessageCircle, title: "Prática com propósito", text: "Speaking e comunicação conectados às situações que fazem parte da sua vida." },
];

function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`home-reveal ${className}`}>{children}</div>;
}

export function HomepageExperience({ lessonCount }: { lessonCount: number }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [cookieVisible, setCookieVisible] = useState(() => typeof document !== "undefined" && !document.cookie.split("; ").some((item) => item.startsWith("site-cookie-consent=")));
  const slide = slides[activeSlide];

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")), { threshold: 0.12 });
    document.querySelectorAll(".home-reveal").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % slides.length), 7000);
    return () => window.clearInterval(timer);
  }, [isPaused]);

  const acceptCookies = () => {
    document.cookie = "site-cookie-consent=accepted; max-age=31536000; path=/; SameSite=Lax";
    setCookieVisible(false);
  };

  return <main className="homepage bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <section className="home-hero relative overflow-hidden bg-white dark:bg-slate-950">
      <div className={`absolute inset-0 bg-gradient-to-br ${slide.accent} opacity-[0.04] transition-colors duration-700`} />
      <div className="relative mx-auto grid min-h-0 lg:min-h-[min(780px,calc(100vh-76px))] max-w-7xl items-center gap-10 px-5 pb-16 pt-12 sm:px-8 lg:grid-cols-[1.02fr_.98fr] lg:gap-16 lg:px-12 lg:py-20">
        <Reveal className="relative z-10 max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-200 bg-white/90 px-3 py-1.5 text-xs font-black uppercase dark:border-red-900 dark:bg-slate-900 tracking-[0.14em] text-red-700 shadow-sm"><Sparkles size={14} /> {slide.eyebrow}</div>
          <p className="mb-4 text-sm font-bold text-red-700">Anderson Palafoz · Professor de Inglês</p>
          <h1 className="max-w-2xl text-4xl font-black leading-[1.03] sm:text-6xl tracking-[-0.04em] text-slate-900 dark:text-white sm:text-6xl lg:text-7xl">{slide.title}</h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">{slide.text}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href={slide.href} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#d62828] px-6 text-sm font-black text-white shadow-lg shadow-red-700/20 transition hover:-translate-y-1 hover:bg-[#b91c1c]">{slide.cta}<ArrowRight size={17} /></Link><Link href="/sobre" className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-300 bg-white/70 px-6 text-sm font-black text-slate-700 transition hover:-translate-y-1 hover:border-red-300 hover:text-red-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">Conhecer minha abordagem</Link></div>
          <div className="mt-10 flex items-center gap-4"><div className="flex gap-2" aria-label="Slides da apresentação">{slides.map((item, index) => <button key={item.title} type="button" aria-label={`Ir para slide ${index + 1}`} aria-current={index === activeSlide} onClick={() => setActiveSlide(index)} className={`h-2 rounded-full transition-all ${index === activeSlide ? "w-10 bg-red-600" : "w-2 bg-red-200 hover:bg-red-400"}`} />)}</div><span className="text-xs font-bold text-slate-500">{String(activeSlide + 1).padStart(2, "0")} / 03</span><button type="button" onClick={() => setIsPaused((paused) => !paused)} aria-pressed={isPaused} className="text-xs font-black text-slate-500 underline-offset-4 hover:text-red-700 hover:underline">{isPaused ? "Continuar" : "Pausar"}</button></div>
        </Reveal>
        <Reveal className="relative mx-auto w-full max-w-[560px] lg:justify-self-end">
          <div className="absolute -right-5 -top-7 hidden h-28 w-28 rounded-full border-[18px] border-slate-300 sm:block" /><div className="relative overflow-hidden rounded-[2rem] border-[10px] border-white bg-slate-200 dark:border-slate-800 dark:bg-slate-900 shadow-2xl shadow-slate-950/15"><Image src="/principal.png" alt="Anderson Palafoz, professor de inglês" width={800} height={800} priority className="aspect-[4/4.5] w-full object-cover" /><div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl bg-white/90 p-4 shadow-lg backdrop-blur"><div><p className="text-xs font-black uppercase tracking-wider text-red-600 dark:text-red-300">Plataforma ativa</p><p className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">Aprenda no seu ritmo</p></div><div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white"><Play size={16} fill="currentColor" /></div></div></div>
        </Reveal>
      </div>
    </section>

    <Reveal><section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"><div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 py-7 sm:grid-cols-4 sm:px-8 lg:px-12"><div><strong className="text-2xl font-black text-red-600">{lessonCount || "Mais"}</strong><p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">aulas disponíveis</p></div><div><strong className="text-2xl font-black text-red-600">A1–C2</strong><p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">níveis de aprendizagem</p></div><div><strong className="text-2xl font-black text-red-600">100%</strong><p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">conteúdo autoral</p></div><div><strong className="text-2xl font-black text-red-600">1:1</strong><p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">olhar para você</p></div></div></section></Reveal>

    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12"><Reveal><div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-red-600">Uma experiência completa</p><h2 className="max-w-xl text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">Tudo o que você precisa para avançar com confiança.</h2></div><Link href="/sobre" className="inline-flex items-center gap-2 text-sm font-black text-red-600 hover:text-red-800">Ver como funciona <ArrowRight size={16} /></Link></div></Reveal><div className="grid gap-5 md:grid-cols-3">{highlights.map(({ icon: Icon, title, text }, index) => <Reveal key={title} className={`delay-${index + 1}`}><article className="group h-full rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_10px_30px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900 transition duration-300 hover:-translate-y-2 hover:border-red-200 hover:shadow-xl"><div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300 transition group-hover:bg-red-600 group-hover:text-white"><Icon size={23} /></div><h3 className="text-xl font-black text-slate-900 dark:text-slate-100">{title}</h3><p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{text}</p><span className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-600">Descobrir <ArrowRight size={14} /></span></article></Reveal>)}</div></section>

    <Reveal><section className="mx-5 overflow-hidden rounded-[2rem] bg-slate-900 sm:mx-8 lg:mx-auto lg:max-w-7xl"><div className="grid items-center gap-8 px-7 py-12 sm:px-12 lg:grid-cols-[1fr_auto] lg:px-16"><div><p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-red-300">Comece pelo próximo passo</p><h2 className="max-w-2xl text-3xl font-black tracking-tight text-white sm:text-4xl">Seu inglês merece uma experiência feita com clareza.</h2><p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">Explore os cursos, encontre materiais gratuitos e fale comigo sobre seus objetivos.</p></div><Link href="/contato" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-black text-[#382d2b] transition hover:-translate-y-1 hover:bg-red-50">Vamos conversar <ArrowRight size={17} /></Link></div></section></Reveal>
    <div className="pb-10 pt-20"><GoogleReviewsSection compact limit={3} /></div>

    {cookieVisible && <aside className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:flex sm:items-center sm:gap-5 sm:p-5" role="dialog" aria-label="Aviso de cookies"><div className="min-w-0 flex-1"><p className="text-sm font-black text-slate-900 dark:text-white">Sua privacidade importa</p><p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">Usamos cookies essenciais para manter o site funcionando e melhorar sua experiência.</p></div><div className="mt-3 flex shrink-0 items-center gap-2 sm:mt-0"><Link href="/privacidade" className="rounded-full px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50">Saiba mais</Link><button type="button" onClick={acceptCookies} className="rounded-full bg-red-600 px-4 py-2 text-xs font-black text-white hover:bg-red-700">Aceitar</button></div></aside>}
  </main>;
}
