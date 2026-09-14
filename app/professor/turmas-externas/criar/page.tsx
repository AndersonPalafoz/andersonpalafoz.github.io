import Link from "next/link";
import { ExternalClassesPageHeader, ExternalClassesSectionNav } from "@/components/external-classes-section-nav";

export const metadata = { title: "Criar turma externa | Anderson Palafoz" };

export default function CreateExternalClassPage() {
  return <main className="site-shell px-4 py-6 sm:px-6 lg:px-8"><div className="page-container space-y-5"><ExternalClassesPageHeader eyebrow="Turmas externas · cadastro" title="Criar nova turma" description="Preencha somente os dados da nova turma. O cadastro de alunos e os registros acadêmicos ficam em áreas separadas." /><ExternalClassesSectionNav /><section className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm"><h2 className="text-lg font-black text-foreground">Formulário de criação</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">O formulário completo de turma externa está sendo separado desta visão. Abra o fluxo atual para concluir o cadastro sem perder nenhuma validação existente.</p><Link href="/professor/turmas-externas" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700">Abrir formulário de nova turma</Link></section></div></main>;
}
