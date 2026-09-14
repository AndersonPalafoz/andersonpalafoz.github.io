import Link from "next/link";
import { ExternalClassesPageHeader, ExternalClassesSectionNav } from "@/components/external-classes-section-nav";

export const metadata = { title: "Gerenciar turmas externas | Anderson Palafoz" };

export default function ManageExternalClassesPage() {
  return <main className="site-shell px-4 py-6 sm:px-6 lg:px-8"><div className="page-container space-y-5"><ExternalClassesPageHeader eyebrow="Turmas externas · gestão" title="Gerenciar turmas" description="Consulte as turmas cadastradas e abra uma turma por vez para cuidar de alunos, frequência, notas e materiais." /><ExternalClassesSectionNav /><section className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm"><h2 className="text-lg font-black text-foreground">Turmas cadastradas</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">A gestão está separada do cadastro. Abra o painel de turmas para consultar alunos, frequência, notas e materiais.</p><Link href="/professor/turmas-externas?view=manage" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700">Abrir gerenciamento</Link></section></div></main>;
}
