"use client";

import Link from "next/link";
import { ArrowRight, BookOpenCheck, CalendarDays, ClipboardCheck, FileSignature, Globe2, Mic2, ShieldCheck, Users } from "lucide-react";

const teachingOperations = [
  { label: "Turmas externas", detail: "Calendário, alunos, frequência, notas e exportações.", href: "/professor/turmas-externas", icon: CalendarDays, tone: "emerald" },
  { label: "Tarefas e prazos", detail: "Criar, editar, duplicar, corrigir e acompanhar atividades.", href: "/professor/tarefas", icon: ClipboardCheck, tone: "indigo" },
  { label: "Aulas e speaking", detail: "Progresso de aulas, gravações, rubricas e feedback.", href: "/professor/progresso-aulas", icon: Mic2, tone: "cyan" },
  { label: "Alunos e certificados", detail: "Aprovação, histórico acadêmico, emissão e assinaturas.", href: "/professor/alunos", icon: Users, tone: "orange" },
];

const globalOperations = [
  { label: "Escopo global", detail: "Visualiza e opera registros de todos os professores, turmas e cursos.", href: "/admin/relatorios-academicos", icon: Globe2 },
  { label: "Governança", detail: "Gerencia permissões, usuários, conteúdo, integrações e configurações.", href: "/admin/usuarios", icon: ShieldCheck },
  { label: "Conteúdo acadêmico", detail: "Edita cursos, módulos, materiais, avaliações e modelos reutilizáveis.", href: "/admin/cursos", icon: BookOpenCheck },
  { label: "Certificação oficial", detail: "Revisa pendências, modelos, assinaturas e validações públicas.", href: "/admin/certificados", icon: FileSignature },
];

function CapabilityCard({ item, global = false }: { item: (typeof teachingOperations)[number] | (typeof globalOperations)[number]; global?: boolean }) {
  const Icon = item.icon;
  return (
    <Link href={item.href} className="group flex min-w-0 items-start gap-3 rounded-2xl border border-border/70 bg-background/80 p-4 transition hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${global ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300" : "bg-muted text-foreground"}`}><Icon size={18} aria-hidden="true" /></span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-sm font-black text-foreground"><span className="truncate">{item.label}</span>{global && <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-red-700 dark:bg-red-950/50 dark:text-red-300">Admin</span>}</span>
        <span className="mt-1 block text-[11px] leading-relaxed text-muted-foreground">{item.detail}</span>
        <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-black text-red-700 dark:text-red-300">Abrir operação <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" /></span>
      </span>
    </Link>
  );
}

export function AdminCapabilityMap() {
  return (
    <section className="surface-card overflow-hidden rounded-3xl border border-border/70 shadow-[0_16px_45px_rgba(15,23,42,0.06)]" aria-labelledby="admin-capability-map-title">
      <div className="border-b border-border/70 bg-gradient-to-r from-slate-50 via-card to-red-50/50 p-5 dark:from-slate-950/30 dark:via-card dark:to-red-950/20 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-700 dark:text-red-300">Matriz operacional</p>
            <h2 id="admin-capability-map-title" className="mt-1 text-xl font-black text-foreground">Operações docentes sob governança global</h2>
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-muted-foreground">O administrador pode executar as operações do professor, mas trabalha com visão transversal, controle de todos os registros e ações administrativas adicionais.</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"><ShieldCheck size={14} /> Escopo global</span>
        </div>
      </div>
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 text-sm font-black text-foreground">Capacidades herdadas do professor</h3>
          <div className="grid gap-3">{teachingOperations.map((item) => <CapabilityCard key={item.href} item={item} />)}</div>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-black text-foreground">Poderes adicionais do administrador</h3>
          <div className="grid gap-3">{globalOperations.map((item) => <CapabilityCard key={item.href} item={item} global />)}</div>
        </div>
      </div>
    </section>
  );
}
