import { ExternalClassesManager } from "@/components/external-classes-manager";
import { ExternalClassesPageHeader, ExternalClassesSectionNav } from "@/components/external-classes-section-nav";

export const metadata = { title: "Gerenciar turmas externas | Anderson Palafoz" };

export default function ManageExternalClassesPage() {
  return <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8"><div className="page-container space-y-5"><ExternalClassesPageHeader eyebrow="Turmas externas · gestão" title="Gerenciar turmas" description="Consulte as turmas cadastradas e abra uma turma por vez para cuidar de alunos, frequência, notas e materiais." /><ExternalClassesSectionNav /><ExternalClassesManager /></div></main>;
}
