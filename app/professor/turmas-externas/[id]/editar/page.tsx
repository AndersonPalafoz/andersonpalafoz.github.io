import { ExternalClassesPageHeader, ExternalClassesSectionNav } from "@/components/external-classes-section-nav";
import { ExternalClassEditPage } from "@/components/external-class-edit-page";

export const metadata = { title: "Editar turma externa | Anderson Palafoz" };

export default function EditExternalClassPage() {
  return <main className="site-shell px-4 py-6 sm:px-6 lg:px-8"><div className="page-container space-y-6"><ExternalClassesPageHeader eyebrow="Turmas externas · edição" title="Editar turma" description="Atualize calendário, critérios acadêmicos, carga horária, horários e informações da turma sem perder os registros existentes." /><ExternalClassesSectionNav /><ExternalClassEditPage /></div></main>;
}
