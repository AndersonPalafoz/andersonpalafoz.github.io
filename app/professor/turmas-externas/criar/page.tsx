import { ExternalClassCreateForm } from "@/components/external-class-create-form";
import { ExternalClassesPageHeader, ExternalClassesSectionNav } from "@/components/external-classes-section-nav";

export const metadata = { title: "Criar turma externa | Anderson Palafoz" };

export default function CreateExternalClassPage() {
  return <main className="site-shell px-4 py-6 sm:px-6 lg:px-8"><div className="page-container space-y-6"><ExternalClassesPageHeader eyebrow="Turmas externas · cadastro" title="Criar nova turma" description="Cadastre a turma em uma tela própria. Alunos e acompanhamento ficam em áreas separadas." /><ExternalClassesSectionNav /><ExternalClassCreateForm /></div></main>;
}
