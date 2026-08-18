import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { TeacherProgressExport } from "@/components/teacher-progress-export";
import { TeacherAnalyticsCharts } from "@/components/teacher-analytics-charts";
import { db } from "@/lib/db";
import { users, progress, enrollments, courses } from "@/drizzle/schema";
import { and, eq, inArray, isNull } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata = { title: "Progresso dos Alunos | Painel do Professor", description: "Acompanhamento detalhado do progresso dos alunos nos cursos da plataforma." };

export default async function TeacherStudentProgressPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "professor" && session.user.role !== "admin")) redirect("/");
  const teacher = session.user.email ? await db.query.users.findFirst({ where: eq(users.email, session.user.email) }) : null;
  const courseRows = await db.select().from(courses);
  const visibleCourses = session.user.role === "admin" ? courseRows : courseRows.filter((course) => course.instructor === "Anderson Palafoz" || course.instructor === teacher?.name);
  const visibleCourseIds = visibleCourses.map((course) => course.id);
  const allEnrollments = visibleCourseIds.length ? await db.select().from(enrollments).where(inArray(enrollments.courseId, visibleCourseIds)) : [];
  const studentIds = Array.from(new Set(allEnrollments.map((enrollment) => enrollment.userId)));
  const students = studentIds.length ? await db.select().from(users).where(and(eq(users.role, "user"), isNull(users.deletedAt), inArray(users.id, studentIds))) : [];
  const allProgress = studentIds.length && visibleCourseIds.length ? await db.select().from(progress).where(and(inArray(progress.userId, studentIds), inArray(progress.courseId, visibleCourseIds))) : [];
  const courseTitles = new Map(visibleCourses.map((course) => [course.id, course.title]));
  const allPercentages = allProgress.map((item) => item.percentageCompleted).filter((value): value is number => typeof value === "number");
  const averageProgress = allPercentages.length ? Math.round(allPercentages.reduce((sum, value) => sum + value, 0) / allPercentages.length) : null;
  const activeStudents = students.filter((student) => allProgress.some((item) => item.userId === student.id && (item.lessonsCompleted ?? 0) > 0)).length;

  return <div className="site-shell px-4 py-8 sm:px-6 lg:px-8"><div className="page-container space-y-8"><div className="surface-card flex flex-col justify-between gap-4 p-5 sm:p-7 md:flex-row md:items-center"><div><Link href="/professor" className="mb-2 flex items-center gap-1 text-sm font-semibold text-red-600 hover:underline"><ArrowLeft size={16} /> Voltar ao Painel do Professor</Link><h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-foreground"><Users className="text-red-600" size={32} /> Acompanhamento de Progresso Individual</h1><p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">Visualize somente o andamento dos alunos e cursos pertencentes ao seu escopo.</p></div></div><TeacherAnalyticsCharts totalStudents={students.length} activeStudents={activeStudents} averageProgress={averageProgress} totalEnrollments={allEnrollments.length} /><div className="surface-card overflow-hidden p-5 sm:p-6"><div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><h2 className="text-xl font-black text-foreground">Alunos Cadastrados e Desempenho</h2><TeacherProgressExport students={students.map((student) => ({ name: student.name, email: student.email, enrollmentsCount: allEnrollments.filter((enrollment) => enrollment.userId === student.id).length, approvalStatus: student.approvalStatus || "pending" }))} /></div>{students.length === 0 ? <p className="py-8 text-center text-muted-foreground">Nenhum aluno matriculado no escopo atual.</p> : <div className="space-y-6">{students.map((student) => { const studentProgressList = allProgress.filter((item) => item.userId === student.id); const studentEnrollments = allEnrollments.filter((enrollment) => enrollment.userId === student.id); return <div key={student.id} className="space-y-4 rounded-2xl border border-border/70 bg-muted/50 p-5 sm:p-6"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-lg font-bold text-red-600">{student.name ? student.name.charAt(0).toUpperCase() : "A"}</div><div><h3 className="text-lg font-black text-foreground">{student.name || "Aluno sem nome"}</h3><p className="text-sm text-muted-foreground">{student.email || "E-mail não cadastrado"} • {student.phone || "Telefone não cadastrado"}</p></div></div><div className="flex items-center gap-2"><span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">{student.approvalStatus === "approved" ? "Aprovado" : "Pendente"}</span><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{studentEnrollments.length} matrícula(s)</span></div></div><div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-3">{studentEnrollments.length === 0 ? <p className="col-span-3 text-xs text-muted-foreground">Nenhuma matrícula encontrada.</p> : studentEnrollments.map((enrollment) => { const prog = studentProgressList.find((item) => item.courseId === enrollment.courseId); const percentage = prog?.percentageCompleted; return <div key={enrollment.id} className="surface-card space-y-2 p-4"><div className="flex items-center justify-between"><span className="truncate text-sm font-bold text-foreground">{courseTitles.get(enrollment.courseId) || `Curso #${enrollment.courseId}`}</span><span className="text-xs font-bold text-red-600">{percentage === null || percentage === undefined ? "—" : `${percentage}%`}</span></div><div className="h-2 w-full overflow-hidden rounded-full bg-muted"><div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${percentage ?? 0}%` }} /></div><div className="flex items-center justify-between pt-1 text-xs text-muted-foreground"><span>{prog ? `${prog.lessonsCompleted ?? 0} de ${prog.totalLessons ?? 0} aulas` : "Sem progresso registrado"}</span><span className="capitalize">{prog?.status === "completed" ? "Concluído" : prog ? "Em andamento" : "Sem registro"}</span></div></div>; })}</div></div>; })}</div>}</div></div></div>;
}
