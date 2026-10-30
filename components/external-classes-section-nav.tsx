import Link from "next/link";
import { ArrowLeft, BookOpen, Plus, Users, Settings2 } from "lucide-react";

const items = [
  { href: "/professor/turmas-externas/gerenciar", label: "Turmas", description: "Consultar e administrar turmas", icon: Settings2 },
  { href: "/professor/turmas-externas/criar", label: "Nova turma", description: "Cadastrar uma turma externa", icon: Plus },
  { href: "/professor/turmas-externas/alunos", label: "Alunos", description: "Cadastrar e acompanhar alunos", icon: Users },
];

export function ExternalClassesSectionNav() {
  return <nav aria-label="Seções de turmas externas" className="grid gap-2 sm:grid-cols-3">{items.map(({ href, label, description, icon: Icon }) => <Link key={href} href={href} className="group rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-4 py-3 transition hover:border-red-200 hover:bg-slate-50 hover:shadow-sm dark:hover:bg-slate-800"><span className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white"><Icon size={16} className="text-red-600" aria-hidden="true" />{label}</span><span className="mt-1 block text-xs text-slate-600 dark:text-slate-300">{description}</span></Link>)}</nav>;
}

export function ExternalClassesPageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <header className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm sm:p-7"><Link href="/professor/turmas-externas" className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-red-600 hover:underline"><ArrowLeft size={16} aria-hidden="true" /> Área externa</Link><div className="flex items-start gap-3"><div className="rounded-xl border border-slate-200 bg-slate-100 p-2.5 text-red-600 dark:border-slate-700 dark:bg-slate-900"><BookOpen size={22} aria-hidden="true" /></div><div><p className="text-[11px] font-black uppercase tracking-[0.16em] text-red-600">{eyebrow}</p><h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p></div></div></header>;
}

export function ExternalClassesEmptyState({ title, description, href, label }: { title: string; description: string; href: string; label: string }) {
  return <section className="rounded-2xl border border-dashed border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900 p-8 text-center"><h2 className="text-lg font-black text-slate-900 dark:text-white">{title}</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p><Link href={href} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700">{label}</Link></section>;
}

export function ExternalClassesBackLink() { return <Link href="/professor/turmas-externas" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-red-600">Voltar para turmas externas</Link>; }
