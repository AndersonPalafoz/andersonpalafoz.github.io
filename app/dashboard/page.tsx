import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserEnrollments, getCertificates, getUserActivityProgress, getResumeLesson } from "@/lib/db";
import { BookOpen, Award, CheckSquare, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WeeklyGoalsWidget } from "./metas-semanais";
import { ClassroomGradesNotificationBanner } from "./classroom-notifications";
import { OnboardingModal } from "@/components/onboarding-modal";
import { ClassroomImportAction } from "@/components/classroom-import-action";
import { WeeklyProgressChart } from "@/components/weekly-progress-chart";
import { StreakCelebrationModal } from "@/components/streak-celebration-modal";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = parseInt(session?.user?.id ?? "");

  let enrollments: Awaited<ReturnType<typeof getUserEnrollments>> = [];
  let certificates: Awaited<ReturnType<typeof getCertificates>> = [];
  let atividades: Awaited<ReturnType<typeof getUserActivityProgress>> = [];

  if (!isNaN(userId) && userId > 0) {
    [enrollments, certificates, atividades] = await Promise.all([
      getUserEnrollments(userId),
      getCertificates(userId),
      getUserActivityProgress(userId),
    ]);
  }

  const cursosAtivos = await Promise.all(
    enrollments
      .filter((enrollment) => enrollment.status === "active")
      .map(async (enrollment) => ({
        ...enrollment,
        resume: enrollment.course ? await getResumeLesson(userId, enrollment.course.id) : null,
      })),
  );
  const atividadesPendentes = atividades.filter((activity) => activity.status !== "completed");
  const primeiroNome = session?.user?.name?.split(" ")[0] || "aluno(a)";

  const metrics = [
    { label: "Cursos ativos", value: cursosAtivos.length, icon: BookOpen, tone: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300" },
    { label: "Atividades pendentes", value: atividadesPendentes.length, icon: CheckSquare, tone: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" },
    { label: "Certificados obtidos", value: certificates.length, icon: Award, tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" },
  ];

  return (
    <div className="space-y-10 pb-16">
      <StreakCelebrationModal />
      <OnboardingModal />

      <header className="flex flex-col gap-4 border-b border-border/70 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="eyebrow">Área do aluno</span>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl">Olá, {primeiroNome}</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">Aqui está um resumo do seu progresso e dos próximos passos da sua jornada.</p>
        </div>
        <div className="hidden items-center gap-2 rounded-2xl border border-red-100 bg-red-50/70 px-4 py-3 text-xs font-bold text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200 sm:flex">
          <Sparkles size={16} /> Aprenda com clareza e propósito
        </div>
      </header>

      {/* Banner de Notificações de Notas do Google Classroom */}
      <ClassroomGradesNotificationBanner />

      <section aria-label="Resumo acadêmico" className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {metrics.map(({ label, value, icon: Icon, tone }) => (
          <article key={label} className="surface-card interactive-card p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}><Icon size={21} /></div>
              <span className="text-3xl font-black tracking-tight text-foreground">{value}</span>
            </div>
            <p className="mt-4 text-sm font-semibold text-muted-foreground">{label}</p>
          </article>
        ))}
      </section>

      {/* Widget de Metas Semanais */}
      <WeeklyGoalsWidget />

      {/* Gráfico de Progresso Semanal Real */}
      <WeeklyProgressChart />

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="muted-label">Seu próximo passo</span>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-foreground">Continuar aprendendo</h2>
          </div>
          <Link href="/aulas" className="text-sm font-bold text-primary transition hover:text-primary/80">Explorar catálogo <ArrowRight className="ml-1 inline" size={15} /></Link>
        </div>

        {cursosAtivos.length === 0 ? (
          <div className="space-y-6">
            <div className="surface-card border-dashed p-8 text-center sm:p-12">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"><BookOpen size={24} /></div>
              <h3 className="mt-4 text-lg font-black text-foreground">Sua próxima conquista começa aqui</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Você ainda não está inscrito em um curso. Como sua conta começou zerada por padrão, encontre uma trilha adequada ao seu nível ou importe do Classroom.</p>
              <Button asChild className="mt-6"><Link href="/aulas">Explorar cursos <ArrowRight size={17} /></Link></Button>
            </div>
            {/* Ação para importar do Google Classroom em painéis vazios */}
            <ClassroomImportAction />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {cursosAtivos.map((enrollment) => {
              const percentage = enrollment.resume?.percentage ?? enrollment.progress;
              const courseHref = enrollment.resume?.lesson ? `/cursos/${enrollment.course?.id}/aulas/${enrollment.resume.lesson.id}` : `/cursos/${enrollment.course?.id}`;
              return (
                <article key={enrollment.id} className="surface-card interactive-card overflow-hidden p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    {enrollment.course?.imageUrl ? <img src={enrollment.course.imageUrl} alt="" className="h-16 w-24 shrink-0 rounded-2xl object-cover" /> : <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-400 dark:bg-red-950/40"><BookOpen size={22} /></div>}
                    <div className="min-w-0 flex-1">
                      <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-red-700 dark:bg-red-950/40 dark:text-red-300">{enrollment.course?.level}</span>
                      <h3 className="mt-2 truncate text-lg font-black text-foreground">{enrollment.course?.title}</h3>
                    </div>
                  </div>
                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-muted-foreground"><span>Progresso</span><span className="text-primary">{percentage}%</span></div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percentage}%` }} /></div>
                  </div>
                  {enrollment.resume?.lesson && <p className="mt-4 rounded-xl border border-red-100 bg-red-50/70 px-3 py-2.5 text-xs leading-5 text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200"><span className="font-black">Próxima aula:</span> {enrollment.resume.lesson.title}</p>}
                  <Button asChild variant="outline" className="mt-5 w-full"><Link href={courseHref}>{enrollment.resume?.lesson ? "Continuar da última aula" : "Abrir curso"}<ArrowRight size={16} /></Link></Button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Seção de Histórico de Cursos Acessados e Progresso de Conclusão */}
      <section className="space-y-4 pt-4 border-t border-border/70">
        <div>
          <span className="muted-label">Registro acadêmico</span>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-foreground">Histórico de cursos acessados e progresso</h2>
          <p className="mt-1 text-sm text-muted-foreground">Linha do tempo completa de todos os cursos em que você se matriculou ou teve acesso.</p>
        </div>

        {enrollments.length === 0 ? (
          <div className="surface-card p-6 text-center text-sm text-muted-foreground">
            Nenhum histórico de curso registrado até o momento.
          </div>
        ) : (
          <div className="surface-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/55 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Curso / Nível</th>
                    <th className="px-5 py-3 font-semibold">Data de Matrícula</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Progresso</th>
                    <th className="px-5 py-3 text-right font-semibold">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {enrollments.map((enr) => {
                    const pct = enr.progress ?? 0;
                    const isCompleted = pct >= 100 || enr.status === "completed";
                    const formattedDate = enr.enrolledAt ? new Date(enr.enrolledAt).toLocaleDateString("pt-BR") : "—";
                    return (
                      <tr key={enr.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-bold text-foreground">{enr.course?.title || `Curso #${enr.courseId}`}</p>
                          <p className="text-xs text-muted-foreground uppercase">{enr.course?.level || "Geral"}</p>
                        </td>
                        <td className="px-5 py-4 text-xs font-semibold text-muted-foreground">{formattedDate}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wide ${isCompleted ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"}`}>
                            {isCompleted ? "Concluído" : "Em andamento"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="w-32 space-y-1">
                            <div className="flex justify-between text-[11px] font-bold text-muted-foreground">
                              <span>{pct}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/cursos/${enr.courseId}`}>Acessar</Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
