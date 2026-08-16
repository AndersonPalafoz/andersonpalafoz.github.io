import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserEnrollments, getResumeLesson } from "@/lib/db";
import { BookOpen, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function CursosPage() {
  const session = await getServerSession(authOptions);
  const userId = parseInt(session?.user?.id ?? "");
  const enrollments = !isNaN(userId) && userId > 0 ? await getUserEnrollments(userId) : [];
  const enrichedEnrollments = await Promise.all(enrollments.map(async (enrollment) => ({ ...enrollment, resume: enrollment.course ? await getResumeLesson(userId, enrollment.course.id) : null })));

  return (
    <div className="space-y-8">
      <header className="border-b border-border/70 pb-6">
        <span className="eyebrow">Sua jornada</span>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl">Meus cursos</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">Acompanhe seu progresso nos cursos de inglês e retome seus estudos com clareza.</p>
      </header>

      {enrollments.length === 0 ? (
        <div className="empty-state">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"><BookOpen size={24} /></div>
          <h2 className="mt-4 text-lg font-black text-foreground">Você ainda não começou uma trilha</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Explore o catálogo e encontre um curso alinhado ao seu nível e aos seus objetivos.</p>
          <Button asChild className="mt-6"><Link href="/aulas">Explorar cursos <ArrowRight size={17} /></Link></Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {enrichedEnrollments.map((enrollment) => {
            const percentage = enrollment.resume?.percentage ?? enrollment.progress;
            const completed = Number(enrollment.progress) >= 100 || enrollment.status === "completed";
            return (
              <article key={enrollment.id} className="surface-card interactive-card flex h-full flex-col p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"><BookOpen size={20} /></div>
                    <div className="min-w-0"><h2 className="truncate text-base font-black text-foreground">{enrollment.course?.title}</h2><p className="mt-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">{enrollment.course?.level}</p></div>
                  </div>
                  {completed && <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"><CheckCircle2 size={13} /> Concluído</span>}
                </div>

                {enrollment.course?.description && <p className="mt-5 line-clamp-3 text-sm leading-6 text-muted-foreground">{enrollment.course.description}</p>}
                {enrollment.resume?.lesson && <p className="mt-5 rounded-xl border border-red-100 bg-red-50/70 px-3 py-2.5 text-xs leading-5 text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200"><span className="font-black">Retomar em:</span> {enrollment.resume.lesson.title}</p>}

                <div className="mt-auto pt-6">
                  <div className="flex items-center justify-between text-xs font-bold text-muted-foreground"><span>Progresso</span><span className="text-primary">{percentage}%</span></div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percentage}%` }} /></div>
                  {enrollment.course && <Button asChild className="mt-5 w-full"><Link href={`/cursos/${enrollment.course.id}`}>{enrollment.resume?.lesson ? "Continuar de onde parei" : enrollment.progress > 0 ? "Continuar" : "Começar"}<ArrowRight size={16} /></Link></Button>}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
