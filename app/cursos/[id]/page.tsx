import { Suspense } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getCourseById, getModulesByCourse, getLessonsByModule, getResumeLesson, db } from "@/lib/db";
import { formatLevel } from "@/lib/levels";
import { EnrollButton } from "@/components/enroll-button";
import { CourseWaitlistButton } from "@/components/course-waitlist-button";
import { CertificateModal } from "@/components/certificate-modal";
import { CourseEngagement } from "@/components/course-engagement";
import { BookOpen, Layers, PlayCircle, Clock, CheckCircle, ExternalLink, HardDrive } from "lucide-react";
import { coursePurchases, enrollments, lessonProgress } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { parseGoogleDriveLinks } from "@/lib/google-drive-links";
import { getCourseTypeDefinition, getSyncModalityLabel } from "@/lib/course-types";
import { ExternalCourseCta } from "@/components/external-course-cta";

async function CourseModulesList({ courseId, userId }: { courseId: number; userId?: number }) {
  let modules: any[] = [];
  try {
    modules = await getModulesByCourse(courseId);
  } catch (err) {
    console.error("CourseModulesList: failed to fetch modules", err);
  }

  if (!modules || modules.length === 0) {
    return <p className="text-gray-600 dark:text-gray-300 text-sm">Nenhum módulo cadastrado para este curso ainda.</p>;
  }

  // Buscar progresso de aulas do usuário se logado
  let completedLessonIds = new Set<number>();
  if (userId) {
    const allModuleIds = modules.map(m => m.id);
    if (allModuleIds.length > 0) {
      // Obter todas as aulas do curso
      const courseLessons = [];
      for (const modId of allModuleIds) {
        const lessonsInMod = await getLessonsByModule(modId);
        courseLessons.push(...lessonsInMod);
      }
      const lessonIds = courseLessons.map(l => l.id);
      if (lessonIds.length > 0) {
        const progressRecords = await db.query.lessonProgress.findMany({
          where: eq(lessonProgress.userId, userId),
        });
        progressRecords.forEach(p => {
          if (p.completed === 1) completedLessonIds.add(p.lessonId);
        });
      }
    }
  }

  const modulesWithLessons = await Promise.all(
    modules.map(async (mod) => {
      const lessons = await getLessonsByModule(mod.id).catch((error) => {
        console.error("CourseModulesList: failed to fetch lessons", { moduleId: mod.id, error });
        return [];
      });
      const completedInMod = lessons.filter(l => completedLessonIds.has(l.id)).length;
      return { mod, lessons, completedInMod };
    })
  );
  const totalLessons = modulesWithLessons.reduce((total, item) => total + item.lessons.length, 0);

  return (
    <div className="space-y-6">
      {totalLessons === 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm dark:border-amber-800 dark:bg-amber-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div role="status" className="text-sm leading-6 text-amber-950 dark:text-amber-100">
            <p className="font-bold text-base mb-1">Conteúdo em preparação</p>
            <p>Este curso já possui módulos cadastrados, mas nenhuma aula foi publicada ainda. O progresso e o certificado permanecerão bloqueados até que as aulas sejam disponibilizadas.</p>
          </div>
          <CourseWaitlistButton courseId={courseId} />
        </div>
      )}
      {modulesWithLessons.map(({ mod, lessons, completedInMod }) => {
        return (
          <div key={mod.id} className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-red-600">Módulo {mod.order}</span>
                <h3 className="text-xl font-bold text-gray-900 mt-1">{mod.title}</h3>
                {mod.description && <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">{mod.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold bg-gray-100 px-3 py-1 rounded-full text-gray-700 dark:text-gray-300">
                  {completedInMod}/{lessons.length} concluídas
                </span>
              </div>
            </div>

            {lessons.length > 0 ? (
              <div className="divide-y divide-gray-100 border-t border-gray-100 pt-3">
                {lessons.map((lesson) => {
                  const isDone = completedLessonIds.has(lesson.id);
                  return (
                    <Link
                      key={lesson.id}
                      href={`/cursos/${courseId}/aulas/${lesson.id}`}
                      className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-red-50/50 transition group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${isDone
                            ? "border-green-200 bg-green-50 text-green-600"
                            : "border-red-100 bg-red-50 text-red-600 group-hover:scale-110"
                            }`}
                          aria-label={isDone ? "Aula concluída" : "Aula não concluída"}
                          title={isDone ? "Aula concluída" : "Aula não concluída"}
                        >
                          {isDone ? <CheckCircle size={20} aria-hidden="true" /> : <PlayCircle size={20} aria-hidden="true" />}
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className={`font-semibold transition ${isDone ? "text-green-700" : "text-gray-900 group-hover:text-red-600"}`}>
                              Aula #{lesson.order}: {lesson.title}
                            </p>
                            {isDone && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
                                <CheckCircle size={12} aria-hidden="true" /> Concluída
                              </span>
                            )}
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Listening & Speaking</span>
                          </div>
                          {lesson.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-1">{lesson.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 flex-shrink-0">
                        <Clock size={14} />
                        <span>{lesson.duration || 15} min</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">Nenhuma aula cadastrada neste módulo.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

async function CourseDetail({ courseId }: { courseId: number }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  const course = await getCourseById(courseId);

  if (!course) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-700 dark:text-gray-300">Curso não encontrado.</p>
      </div>
    );
  }

  const isExternalCourse = course.courseType === 4;
  const isPrivilegedUser = user?.role === "admin" || user?.role === "professor" || user?.email === "palafozanderson@gmail.com";
  let hasExternalCourseAccess = !isExternalCourse || isPrivilegedUser;

  if (isExternalCourse && !hasExternalCourseAccess && Number.isInteger(Number(user?.id)) && Number(user?.id) > 0) {
    const userId = Number(user.id);
    const [enrollment, purchase] = await Promise.all([
      db.query.enrollments.findFirst({
        where: and(eq(enrollments.userId, userId), eq(enrollments.courseId, course.id)),
      }),
      db.query.coursePurchases.findFirst({
        where: and(eq(coursePurchases.userId, userId), eq(coursePurchases.courseId, course.id)),
      }),
    ]);
    hasExternalCourseAccess = Boolean(enrollment || purchase);
  }

  if (isExternalCourse && !hasExternalCourseAccess) {
    return (
      <div className="min-h-screen bg-white dark:bg-background px-4 py-20">
        <div className="mx-auto max-w-xl rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center shadow-sm dark:border-amber-800 dark:bg-amber-950/30">
          <h1 className="text-2xl font-black text-amber-950 dark:text-amber-100">Curso externo com acesso restrito</h1>
          <p className="mt-3 text-sm leading-6 text-amber-900 dark:text-amber-200">Este curso é administrado para uma turma ou organização específica. Entre na sua conta autorizada ou fale com o professor para solicitar acesso.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href={`/login?callbackUrl=${encodeURIComponent(`/cursos/${course.id}`)}`} className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700">Entrar para continuar</Link>
            <Link href="/contato" className="rounded-xl border border-amber-700 px-5 py-3 text-sm font-bold text-amber-950 hover:bg-amber-100 dark:text-amber-100 dark:hover:bg-amber-900/40">Falar com o professor</Link>
          </div>
        </div>
      </div>
    );
  }

  let modules: any[] = [];
  try {
    modules = await getModulesByCourse(courseId);
  } catch (err) {
    console.error("Failed to load modules for course", courseId, err);
  }

  const resumeLesson = user?.id
    ? await getResumeLesson(Number(user.id), courseId).catch((error) => {
        console.error("Failed to resolve resume lesson", { courseId, userId: user.id, error });
        return null;
      })
    : null;

  const driveLinks = parseGoogleDriveLinks((course as any).googleDriveLinks);
  const courseType = getCourseTypeDefinition(course.courseType);
  const syncLabel = getSyncModalityLabel(course.syncModality);

  // Calcular progresso total do curso para exibição visual de forma segura
  let totalLessonsCount = 0;
  let completedLessonsCount = 0;
  if (user?.id) {
    try {
      for (const mod of modules) {
        const lessonsInMod = await getLessonsByModule(mod.id).catch(() => []);
        totalLessonsCount += lessonsInMod.length;
        for (const l of lessonsInMod) {
          const lp = await db.query.lessonProgress.findFirst({
            where: (table) => and(eq(table.userId, Number(user.id)), eq(table.lessonId, l.id)),
          }).catch(() => null);
          if (lp && lp.completed === 1) completedLessonsCount++;
        }
      }
    } catch (err) {
      console.error("Failed to calculate course progress for user", user.id, err);
    }
  }

  const progressPercentage = totalLessonsCount > 0 ? Math.round((completedLessonsCount / totalLessonsCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-white dark:bg-background dark:text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Breadcrumbs
          items={[
            { label: "Cursos", href: "/cursos" },
            { label: course.title, href: `/cursos/${course.id}` },
          ]}
        />

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="inline-block bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
              {formatLevel(course.level)}
            </span>
            {user && (
                <span className="text-sm font-bold text-gray-700 bg-gray-100 px-4 py-1.5 rounded-full">
                Progresso: {progressPercentage}% concluído {totalLessonsCount > 0 ? `(${completedLessonsCount}/${totalLessonsCount} aulas)` : "(aulas ainda não publicadas)"}
              </span>
            )}
          </div>

          <h1 className="text-4xl font-bold text-gray-900">{course.title}</h1>

          <section className={`rounded-3xl border p-5 shadow-sm sm:p-6 ${courseType.className}`} aria-labelledby="course-type-title">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em]">Modalidade do curso</p>
                <h2 id="course-type-title" className="mt-1 text-xl font-black">{courseType.label}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6">{courseType.description}</p>
              </div>
              <span className="w-fit rounded-full bg-white/80 dark:bg-black/20 px-3 py-1.5 text-xs font-black shadow-sm">{courseType.tag}</span>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="rounded-full bg-white/75 dark:bg-black/20 px-3 py-1.5">{syncLabel}</span>
              {courseType.id === 1 && <span className="rounded-full bg-white/75 dark:bg-black/20 px-3 py-1.5">Acesso assíncrono</span>}
              {courseType.id === 4 && <span className="rounded-full bg-white/75 dark:bg-black/20 px-3 py-1.5">Gestão de turma institucional</span>}
            </div>
            {course.externalRedirectUrl && (courseType.id === 1 || courseType.id === 4) && (
              <ExternalCourseCta href={course.externalRedirectUrl} />
            )}
            {(courseType.id === 3 || courseType.id === 5) && (
              <Link href={`/contato?curso=${course.id}`} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white dark:bg-black/20 px-4 py-3 text-sm font-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2">
                {courseType.id === 5 ? "Entrar em contato para agendar" : "Solicitar um percurso personalizado"} <ExternalLink size={16} aria-hidden="true" />
              </Link>
            )}
          </section>

          {/* Barra de Progresso Visual */}
          {user && (
            <div className="space-y-3">
              <div className="w-full bg-gray-200 dark:bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className="bg-red-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              {progressPercentage === 100 && (
                <div className="flex flex-col sm:flex-row items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/70 p-4 rounded-2xl gap-4">
                  <div>
                    <p className="font-bold text-emerald-900 dark:text-emerald-100">Parabéns! Você concluiu 100% deste curso.</p>
                    <p className="text-sm text-emerald-700 dark:text-emerald-200">Seu certificado oficial de conclusão já está disponível para emissão.</p>
                  </div>
                  <CertificateModal courseId={course.id} courseName={course.title} percentage={progressPercentage} />
                </div>
              )}
            </div>
          )}

          {course.description && (
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">{course.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-6 text-gray-700 dark:text-gray-300 text-sm">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-red-600" />
              <span>{modules.length} {modules.length === 1 ? "módulo" : "módulos"}</span>
            </div>
            {course.instructor && (
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-red-600" />
                <span>{course.instructor}</span>
              </div>
            )}
            <div className={`rounded-full px-3 py-1.5 text-xs font-bold ${course.isFree ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
              {course.isFree ? "Curso gratuito" : `Curso pago • R$ ${Number(course.price || 0).toFixed(2).replace(".", ",")}`}
            </div>
          </div>

          <section
            aria-labelledby="google-drive-materials-title"
            className="relative overflow-hidden rounded-3xl border border-sky-200 dark:border-sky-900/70 bg-gradient-to-br from-sky-50 via-white to-indigo-50 dark:from-sky-950/30 dark:via-background dark:to-indigo-950/25 p-5 shadow-sm sm:p-7"
          >
            <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-sky-100/70 dark:bg-sky-900/30 blur-2xl" aria-hidden="true" />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-sky-950/50 text-sky-700 dark:text-sky-200 shadow-sm ring-1 ring-sky-100 dark:ring-sky-900/70" aria-hidden="true">
                  <HardDrive size={22} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-sky-700">Materiais complementares</p>
                  <h2 id="google-drive-materials-title" className="text-xl font-bold text-slate-900 dark:text-slate-100">Materiais no Google Drive</h2>
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    Acesse os arquivos disponibilizados para este curso em uma nova aba, diretamente no Google Drive.
                  </p>
                </div>
              </div>
              <span className="w-fit shrink-0 rounded-full bg-white dark:bg-slate-900/60 px-3 py-1 text-xs font-semibold text-sky-700 dark:text-sky-200 shadow-sm ring-1 ring-sky-100 dark:ring-sky-900/70">
                {driveLinks.length} {driveLinks.length === 1 ? "link disponível" : "links disponíveis"}
              </span>
            </div>

            {driveLinks.length > 0 ? (
              <ul className="relative mt-6 grid gap-3 sm:grid-cols-2" aria-label="Links de materiais do Google Drive">
                {driveLinks.map((link, index) => (
                  <li key={link}>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex min-h-16 items-center justify-between gap-4 rounded-2xl border border-sky-100 dark:border-sky-900/60 bg-white/90 dark:bg-slate-900/40 px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
                      aria-label={`Abrir material ${index + 1} no Google Drive em nova aba`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-200" aria-hidden="true">
                          <BookOpen size={18} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">Material {index + 1}</span>
                          <span className="block truncate text-xs text-slate-500 dark:text-slate-400">Link direto do Google Drive</span>
                        </span>
                      </span>
                      <ExternalLink className="shrink-0 text-sky-700 transition-transform group-hover:translate-x-0.5" size={18} aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="relative mt-6 rounded-2xl border border-dashed border-sky-200 dark:border-sky-900/70 bg-white/70 dark:bg-slate-900/30 px-4 py-5 text-sm text-slate-600 dark:text-slate-300">
                Nenhum material do Google Drive está vinculado a este curso no momento.
              </div>
            )}
          </section>

          <div className="pt-4 pb-2 flex flex-col sm:flex-row items-center gap-4">
            <EnrollButton
              courseId={course.id}
              isFree={course.isFree ?? true}
              price={course.price}
              resumeLessonId={resumeLesson?.lesson.id ?? null}
            />
            <CertificateModal courseId={course.id} courseName={course.title} percentage={progressPercentage} />
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-border"><h2 className="text-2xl font-bold text-gray-900 mb-6">Módulos e Aulas do Curso</h2><CourseModulesList courseId={course.id} userId={user?.id ? Number(user.id) : undefined} /></div>
          <CourseEngagement courseId={course.id} />
        </div>
      </div>
    </div>
  );
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-gray-700 dark:text-gray-300">Carregando curso...</p>
        </div>
      }
    >
      <CourseDetail courseId={parseInt(id)} />
    </Suspense>
  );
}
