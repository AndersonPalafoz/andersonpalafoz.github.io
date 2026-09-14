import { notFound } from "next/navigation";
import { ExternalClassesPageHeader, ExternalClassesSectionNav } from "@/components/external-classes-section-nav";
import { ExternalClassDetail } from "@/components/external-class-detail";

export const metadata = { title: "Detalhe da turma externa | Anderson Palafoz" };
type PageProps = { params: Promise<{ id: string }> };

export default async function ExternalClassDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  return <main className="site-shell px-4 py-6 sm:px-6 lg:px-8"><div className="page-container space-y-5"><ExternalClassesPageHeader eyebrow={`Turma externa · ${id}`} title="Detalhe da turma" description="Acompanhe alunos, frequência, notas e materiais em um único espaço." /><ExternalClassesSectionNav /><ExternalClassDetail id={id} /></div></main>;
}
