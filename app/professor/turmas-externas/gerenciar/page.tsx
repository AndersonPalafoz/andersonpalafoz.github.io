import { ExternalClassesPageHeader, ExternalClassesSectionNav, ExternalClassesEmptyState } from "@/components/external-classes-section-nav";

export const metadata = { title: "Gerenciar turmas externas | Anderson Palafoz" };

export default function ManageExternalClassesPage() {
  return <main className="site-shell px-4 py-6 sm:px-6 lg:px-8"><div className="page-container space-y-5"><ExternalClassesPageHeader eyebrow="Turmas externas · gestão" title="Gerenciar turmas" description="Consulte as turmas cadastradas e abra uma turma por vez para cuidar de alunos, frequência, notas e materiais." /><ExternalClassesSectionNav /><ExternalClassesEmptyState title="A gestão continua no espaço principal" description="Use a entrada abaixo para consultar as turmas existentes. A próxima etapa é abrir cada turma em uma página própria, sem misturar ações de cadastro com o acompanhamento acadêmico." href="/professor/turmas-externas" label="Abrir turmas cadastradas" /></div></main>;
}
