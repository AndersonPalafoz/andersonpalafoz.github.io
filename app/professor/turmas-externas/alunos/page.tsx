import { ExternalStudentsManager } from "@/components/external-students-manager";
import { ExternalClassesPageHeader, ExternalClassesSectionNav } from "@/components/external-classes-section-nav";

export const metadata = { title: "Alunos de turmas externas | Anderson Palafoz" };

export default function ExternalStudentsPage() {
  return <main className="site-shell px-4 py-6 sm:px-6 lg:px-8"><div className="page-container space-y-5"><ExternalClassesPageHeader eyebrow="Turmas externas · alunos" title="Cadastrar e gerenciar alunos" description="Concentre matrícula, importação de planilha e acompanhamento de alunos em um fluxo próprio, sem competir com o cadastro da turma." /><ExternalClassesSectionNav /><ExternalStudentsManager /></div></main>;
}
