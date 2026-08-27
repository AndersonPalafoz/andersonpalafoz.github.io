"use client";

import Link from "next/link";
import { ArrowRight, BadgePercent, FileText, Globe2, ShieldCheck } from "lucide-react";

const superadminTools = [
  { href: "/admin/cms", label: "CMS e identidade", detail: "Conteúdo global, mídia, revisões e marca.", icon: Globe2 },
  { href: "/admin/cupons", label: "Stripe e cupons", detail: "Descontos, campanhas e controles financeiros.", icon: BadgePercent },
  { href: "/admin/auditoria", label: "Auditoria de acessos", detail: "Rastreabilidade de eventos e mudanças críticas.", icon: FileText },
];

export function SuperadminControlCenter() {
  return (
    <section className="overflow-hidden rounded-3xl border border-violet-200/80 bg-gradient-to-br from-violet-50 via-card to-card shadow-[0_16px_45px_rgba(91,33,182,0.08)] dark:border-violet-900/60 dark:from-violet-950/20" aria-labelledby="superadmin-control-center-title">
      <div className="flex flex-col gap-4 border-b border-violet-200/70 p-5 dark:border-violet-900/40 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-600/20"><ShieldCheck size={21} /></span>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-700 dark:text-violet-300">Camada exclusiva</p>
            <h2 id="superadmin-control-center-title" className="mt-1 text-xl font-black text-foreground">Centro de governança global</h2>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground">Ferramentas de marca, finanças e rastreabilidade. Essas ações não são disponibilizadas a administradores ou professores.</p>
          </div>
        </div>
        <span className="inline-flex shrink-0 rounded-full border border-violet-200 bg-white/80 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-violet-800 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-200">Superadmin</span>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
        {superadminTools.map(tool => {
          const Icon = tool.icon;
          return <Link key={tool.href} href={tool.href} className="group min-w-0 rounded-2xl border border-violet-200/70 bg-white/70 p-4 transition hover:-translate-y-0.5 hover:border-violet-400 hover:shadow-md dark:border-violet-900/50 dark:bg-slate-950/20">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-200"><Icon size={17} /></span>
            <p className="mt-3 text-sm font-black text-foreground">{tool.label}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{tool.detail}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-black text-violet-700 dark:text-violet-300">Abrir controle <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" /></span>
          </Link>;
        })}
      </div>
    </section>
  );
}
