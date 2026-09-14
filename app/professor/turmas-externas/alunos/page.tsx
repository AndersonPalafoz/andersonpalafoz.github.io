import Link from "next/link";
import { ExternalClassesPageHeader, ExternalClassesSectionNav } from "@/components/external-classes-section-nav";

export const metadata = { title: "Alunos de turmas externas | Anderson Palafoz" };

export default function ExternalStudentsPage() {
  return <main className="site-shell px-4 py-6 sm:px-6 lg:px-8"><div className="page-container space-y-5"><ExternalClassesPageHeader eyebrow="Turmas externas · alunos" title="Cadastrar e gerenciar alunos" description="Concentre matrícula, importação de planilha e acompanhamento de alunos em um fluxo próprio, sem competir com o cadastro da turma." /><ExternalClassesSectionNav /><section className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm"><h2 className="text-lg font-black text-foreground">Escolha a turma</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">A seleção da turma e os dados de alunos permanecem conectados ao espaço de gestão atual para preservar permissões, importações e relatórios.</p><Link href="/professor/turmas-externas/alunos" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700">Abrir gestão de alunos</Link></section></div></main>;
}
