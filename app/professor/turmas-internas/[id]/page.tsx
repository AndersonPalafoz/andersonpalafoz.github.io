import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { ArrowLeft, CalendarDays, Mail, Users } from "lucide-react";
import { eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { courseOfferStudents, courseOffers, courses, users } from "@/drizzle/schema";
import { canAccessProfessorPortal, getEffectiveRole } from "@/lib/role-capabilities";
import { canManageCourseOffer, type AdminAuthSession } from "@/lib/admin-auth";

type PageProps = { params: Promise<{ id: string }> };

export default async function InternalClassDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  if (!session?.user || !canAccessProfessorPortal({ email, role: session.user.role })) redirect("/login");
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0 || !await canManageCourseOffer(session as AdminAuthSession, id)) notFound();
  const offer = await db.query.courseOffers.findFirst({ where: eq(courseOffers.id, id) });
  if (!offer) notFound();
  const course = await db.query.courses.findFirst({ where: eq(courses.id, offer.courseId) });
  const students = await db.query.courseOfferStudents.findMany({ where: eq(courseOfferStudents.offerId, id), orderBy: (table, { asc }) => [asc(table.name)] });
  const role = getEffectiveRole({ email, role: session.user.role });

  return <main className="site-shell px-4 py-8 sm:px-6 lg:px-8"><div className="page-container space-y-6"><Link href="/professor/turmas-internas" className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 hover:underline"><ArrowLeft size={16} /> Voltar para turmas internas</Link><header className="dashboard-hero rounded-3xl p-5 sm:p-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-red-600">{course?.level} · {offer.academicTerm}</p><h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">{offer.offerName}</h1><p className="mt-2 text-sm text-muted-foreground">{course?.title}{offer.institution ? ` · ${offer.institution}` : ""}</p></div><span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{offer.status === "published" ? "Publicada" : "Rascunho"}</span></div><div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold text-muted-foreground"><span className="inline-flex items-center gap-2"><Users size={16} /> {students.length} aluno(s)</span><span className="inline-flex items-center gap-2"><CalendarDays size={16} /> {offer.classDays || "Agenda a definir"}{offer.classTime ? ` · ${offer.classTime}` : ""}</span><span>{offer.modality || "Modalidade a definir"}</span></div></header><section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="flex items-center gap-2 text-xl font-black text-foreground"><Users size={20} className="text-red-600" /> Alunos vinculados</h2><p className="mt-1 text-sm text-muted-foreground">A matrícula, o progresso, as atividades e a presença continuam ligados a esta turma.</p></div>{role !== "professor" && <span className="text-xs font-semibold text-muted-foreground">Visão administrativa ampla</span>}</div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="pb-3 font-bold">Aluno</th><th className="pb-3 font-bold">E-mail</th><th className="pb-3 font-bold">Status</th><th className="pb-3 font-bold">Matrícula</th></tr></thead><tbody className="divide-y divide-border">{students.map((student) => <tr key={student.id}><td className="py-4 font-bold text-foreground">{student.socialName || student.name}</td><td className="py-4 text-muted-foreground"><span className="inline-flex items-center gap-1.5"><Mail size={14} /> {student.email || "Sem e-mail"}</span></td><td className="py-4"><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-foreground">{student.status === "active" ? "Ativo" : student.status}</span></td><td className="py-4 text-muted-foreground">{student.enrolledAt.toLocaleDateString("pt-BR")}</td></tr>)}</tbody></table>{students.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Nenhum aluno vinculado a esta turma.</p>}</div></section></div></main>;
}
