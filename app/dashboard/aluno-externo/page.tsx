import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { externalClassAttendance, externalClassGrades, externalClasses, externalStudents, users } from "@/drizzle/schema";
import { calculateCourseGrade } from "@/lib/course-grading";
import { formatAcademicStatus, getAcademicStatus, normalizeExternalGrade, summarizeStudentAttendance } from "@/lib/external-academic-summary";
import { eq, inArray } from "drizzle-orm";
import { BookOpen, CheckCircle2, LockKeyhole } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ExternalStudentArea() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login?callbackUrl=/dashboard/aluno-externo");
  if (session.user.mustChangePassword && session.user.role === "user") redirect("/primeiro-acesso");

  let account = null;
  let records: typeof externalStudents.$inferSelect[] = [];
  let classes: typeof externalClasses.$inferSelect[] = [];
  let grades: typeof externalClassGrades.$inferSelect[] = [];
  let attendance: typeof externalClassAttendance.$inferSelect[] = [];

  try {
    account = await db.query.users.findFirst({ where: eq(users.email, session.user.email) }) || null;
    if (account?.email) {
      records = await db.query.externalStudents.findMany({ where: eq(externalStudents.email, account.email) });
      const classIds = [...new Set(records.map((student) => student.externalClassId))];
      if (classIds.length > 0) {
        classes = await db.query.externalClasses.findMany({ where: inArray(externalClasses.id, classIds) });
        grades = await db.query.externalClassGrades.findMany({ where: inArray(externalClassGrades.studentId, records.map((student) => student.id)) });
        attendance = await db.query.externalClassAttendance.findMany({ where: inArray(externalClassAttendance.externalClassId, classIds) });
      }
    }
  } catch (error) {
    console.error("[ExternalStudentArea] Erro ao carregar dados:", error);
    // Em caso de falha na consulta, renderizamos um estado vazio amigável em vez de quebrar a página inteira
    return (
      <div className="space-y-8 pb-16">
        <header className="dashboard-hero rounded-3xl p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="eyebrow">Área do aluno externo</span>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground">Sua jornada acadêmica</h1>
            </div>
          </div>
        </header>
        <section className="empty-state rounded-3xl p-8 text-center">
          <BookOpen className="mx-auto text-muted-foreground" size={30} />
          <h2 className="mt-4 text-xl font-black text-foreground">Não foi possível carregar suas turmas</h2>
          <p className="mt-2 text-sm text-muted-foreground">Ocorreu um erro temporário ao buscar seus dados. Tente atualizar a página em alguns instantes.</p>
        </section>
      </div>
    );
  }

  return <div className="space-y-8 pb-16"><header className="dashboard-hero rounded-3xl p-6 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><span className="eyebrow">Área do aluno externo</span><h1 className="mt-3 text-3xl font-black tracking-tight text-foreground">Sua jornada acadêmica</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Acompanhe suas turmas, avaliações, médias por unidade, frequência e os critérios necessários para aprovação.</p></div><Link href="/dashboard/aluno-externo/perfil" className="rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-black text-foreground shadow-sm transition hover:bg-muted">Editar meu perfil</Link></div></header>{classes.length === 0 ? <section className="empty-state rounded-3xl p-8 text-center"><BookOpen className="mx-auto text-muted-foreground" size={30} /><h2 className="mt-4 text-xl font-black text-foreground">Nenhuma turma externa vinculada</h2><p className="mt-2 text-sm text-muted-foreground">Seu cadastro precisa ter o mesmo e-mail usado no acesso. Procure o professor ou administrador se você esperava encontrar uma turma aqui.</p></section> : <div className="grid gap-5 lg:grid-cols-2">{classes.map((externalClass) => { const studentIds = records.filter((student) => student.externalClassId === externalClass.id).map((student) => student.id); const classGrades = grades.filter((grade) => studentIds.includes(grade.studentId)); const classAttendance = attendance.filter((record) => record.externalClassId === externalClass.id); const result = calculateCourseGrade({ hasUnits: externalClass.hasUnits, unitCount: externalClass.unitCount, gradingScope: externalClass.gradingScope, passingAverage: externalClass.passingAverage, unitPassingAverages: externalClass.unitPassingAverages }, classGrades.map((grade) => ({ score: normalizeExternalGrade(grade.score, grade.maxScore), unit: grade.unitNumber }))); const attendanceSummary = summarizeStudentAttendance(classAttendance, studentIds[0] || 0, externalClass.startDate ? new Date(externalClass.startDate).toISOString().slice(0, 10) : null, externalClass.endDate ? new Date(externalClass.endDate).toISOString().slice(0, 10) : null); const status = getAcademicStatus(result, attendanceSummary, externalClass.maxAbsencePercent); return <article key={externalClass.id} className="surface-card rounded-3xl p-5 sm:p-6"><div className="flex items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"><BookOpen size={21} /></div><div className="min-w-0 flex-1"><h2 className="text-lg font-black text-foreground">{externalClass.courseName}</h2><p className="mt-1 text-xs font-semibold text-muted-foreground">{externalClass.className} · mínimo geral {result.passingAverage.toFixed(1)}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${status === "approved" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : status === "failed" ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300" : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"}`}>{formatAcademicStatus(status)}</span></div><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"><div className="rounded-2xl bg-muted/50 p-3"><p className="text-[10px] font-bold uppercase text-muted-foreground">Frequência</p><p className="mt-1 text-lg font-black text-foreground">{attendanceSummary.attendanceRate === null ? "—" : `${attendanceSummary.attendanceRate}%`}</p><p className="text-[10px] text-muted-foreground">{attendanceSummary.totalClasses} chamadas</p></div><div className="rounded-2xl bg-muted/50 p-3"><p className="text-[10px] font-bold uppercase text-muted-foreground">Presenças</p><p className="mt-1 text-lg font-black text-foreground">{attendanceSummary.present + attendanceSummary.late}</p><p className="text-[10px] text-muted-foreground">{attendanceSummary.late} atraso(s)</p></div><div className="rounded-2xl bg-muted/50 p-3"><p className="text-[10px] font-bold uppercase text-muted-foreground">Faltas</p><p className="mt-1 text-lg font-black text-foreground">{attendanceSummary.absent}</p><p className="text-[10px] text-muted-foreground">limite {externalClass.maxAbsencePercent ?? 25}%</p></div><div className="rounded-2xl bg-muted/50 p-3"><p className="text-[10px] font-bold uppercase text-muted-foreground">Avaliações</p><p className="mt-1 text-lg font-black text-foreground">{classGrades.length}</p><p className="text-[10px] text-muted-foreground">{result.average === null ? "sem média" : `média ${result.average.toFixed(1)}`}</p></div></div><div className="mt-6 space-y-4">{result.units.map((unit) => { const average = unit.average; const ratio = average === null ? 0 : Math.min(100, Math.max(0, average / 10 * 100)); const passed = average !== null && average >= unit.passingAverage; return <div key={unit.unit}><div className="mb-1.5 flex justify-between gap-3 text-xs font-bold"><span className="text-foreground">Unidade {unit.unit}</span><span className={passed ? "text-emerald-700 dark:text-emerald-300" : average === null ? "text-muted-foreground" : "text-amber-700 dark:text-amber-300"}>{average === null ? "Aguardando notas" : `${average.toFixed(1)} / 10 · mínimo ${unit.passingAverage.toFixed(1)}`}</span></div><div className="h-3 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full transition-all ${passed ? "bg-emerald-500" : average === null ? "bg-slate-300 dark:bg-slate-700" : "bg-amber-500"}`} style={{ width: `${ratio}%` }} /></div><p className="mt-1.5 text-[11px] text-muted-foreground">{passed ? <><CheckCircle2 className="mr-1 inline text-emerald-600" size={13} />Média mínima atingida</> : average === null ? <><LockKeyhole className="mr-1 inline" size={13} />Ainda sem avaliações lançadas</> : "Continue acompanhando suas avaliações"}</p></div>; })}</div><div className="mt-5 border-t border-border/70 pt-4 text-[11px] text-muted-foreground">Período analisado: {attendanceSummary.periodStart && attendanceSummary.periodEnd ? `${new Date(`${attendanceSummary.periodStart}T12:00:00`).toLocaleDateString("pt-BR")} a ${new Date(`${attendanceSummary.periodEnd}T12:00:00`).toLocaleDateString("pt-BR")}` : "nenhuma chamada registrada"}. {attendanceSummary.excused ? `${attendanceSummary.excused} justificativa(s) não entram no percentual de faltas.` : ""}</div></article>; })}</div>}</div>;
}
