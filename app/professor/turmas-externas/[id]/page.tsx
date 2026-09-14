import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalClassesPageHeader, ExternalClassesSectionNav } from "@/components/external-classes-section-nav";

export const metadata = { title: "Detalhe da turma externa | Anderson Palafoz" };

type PageProps = { params: Promise<{ id: string }> };

export default async function ExternalClassDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  return <main className="site-shell px-4 py-6 sm:px-6 lg:px-8"><div className="page-container space-y-5"><ExternalClassesPageHeader eyebrow={`Turma externa · ${id}`} title="Detalhe da turma" description="Uma área dedicada para acompanhar esta turma sem misturar cadastro, gestão de alunos e registros acadêmicos." /><ExternalClassesSectionNav /><nav aria-label="Seções da turma" className="flex flex-wrap gap-2 rounded-2xl border border-border/70 bg-card p-3"><Link href={`/professor/turmas-externas/${id}?tab=students`} className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700 dark:bg-red-950/30 dark:text-red-300">Alunos</Link><Link href={`/professor/turmas-externas/${id}?tab=attendance`} className="rounded-xl px-3 py-2 text-sm font-bold text-muted-foreground hover:bg-muted">Frequência</Link><Link href={`/professor/turmas-externas/${id}?tab=grades`} className="rounded-xl px-3 py-2 text-sm font-bold text-muted-foreground hover:bg-muted">Notas</Link><Link href={`/professor/turmas-externas/${id}?tab=materials`} className="rounded-xl px-3 py-2 text-sm font-bold text-muted-foreground hover:bg-muted">Materiais</Link></nav><section className="rounded-2xl border border-dashed border-border bg-card p-8 text-center"><h2 className="text-lg font-black text-foreground">Workspace da turma</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">Os registros continuam preservados no fluxo atual enquanto cada seção é migrada para esta navegação dedicada.</p><Link href="/professor/turmas-externas" className="mt-5 inline-flex min-h-11 items-center rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-foreground hover:bg-muted">Abrir registros atuais</Link></section></div></main>;
}
