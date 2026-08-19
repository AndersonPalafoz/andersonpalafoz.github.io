import { Suspense } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getCourseById, getModulesByCourse, getLessonsByModule, db } from "@/lib/db";
import { formatLevel } from "@/lib/levels";
import { EnrollButton } from "@/components/enroll-button";
import { CertificateModal } from "@/components/certificate-modal";
import { CourseEngagement } from "@/components/course-engagement";
import { BookOpen, Layers, PlayCircle, Clock, CheckCircle, ExternalLink, HardDrive } from "lucide-react";
import { lessonProgress } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { parseGoogleDriveLinks } from "@/lib/google-drive-links";

async function CourseModulesList({ courseId, userId }: { courseId: number; userId?: number }) {
  let modules: any[] = [];
  try {
    modules = await getModulesByCourse(courseId);
  } catch (err) {
    console.error("CourseModulesList: failed to fetch modules", err);
  }

  if (!modules || modules.length === 0) {
    return <p className="text-gray-500 text-sm">Nenhum módulo cadastrado para este curso ainda.</p>;
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
      const lessons = await getLessonsByModule(mod.id);
      const completedInMod = lessons.filter(l => completedLessonIds.has(l.id)).length;
      return { mod, lessons, completedInMod };
    })
  );

  return (
    <div className="space-y-6">
      {modulesWithLessons.map(({ mod, lessons, completedInMod }) => {
        return (
          <div key={mod.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-red-600">Módulo {mod.order}</span>
                <h3 className="text-xl font-bold text-gray-900 mt-1">{mod.title}</h3>
                {mod.description && <p className="text-gray-600 text-sm mt-1">{mod.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold bg-gray-100 px-3 py-1 rounded-full text-gray-600">
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
                            <p className="text-xs text-gray-500 line-clamp-1">{lesson.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 flex-shrink-0">
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
        <p className="text-gray-600">Curso não encontrado.</p>
      </div>
    );
  }

  let modules: any[] = [];
  try {
    modules = await getModulesByCourse(courseId);
  } catch (err) {
    console.error("Failed to load modules for course", courseId, err);
  }

  const driveLinks = parseGoogleDriveLinks((course as any).googleDriveLinks);

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
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Breadcrumbs
          items={[
            { label: "Aulas", href: "/aulas" },
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
                Progresso: {progressPercentage}% concluído ({completedLessonsCount}/{totalLessonsCount} aulas)
              </span>
            )}
          </div>

          <h1 className="text-4xl font-bold text-gray-900">{course.title}</h1>

          {/* Barra de Progresso Visual */}
          {user && (
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-red-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          )}

          {course.description && (
            <p className="text-lg text-gray-600 leading-relaxed">{course.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-6 text-gray-600 text-sm">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-red-600" />
              <span>{course.modules ?? modules.length} módulos</span>
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
            className="relative overflow-hidden rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-5 shadow-sm sm:p-7"
          >
            <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-sky-100/70 blur-2xl" aria-hidden="true" />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-sky-700 shadow-sm ring-1 ring-sky-100" aria-hidden="true">
                  <HardDrive size={22} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-sky-700">Materiais complementares</p>
                  <h2 id="google-drive-materials-title" className="text-xl font-bold text-slate-900">Materiais no Google Drive</h2>
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
                    Acesse os arquivos disponibilizados para este curso em uma nova aba, diretamente no Google Drive.
                  </p>
                </div>
              </div>
              <span className="w-fit shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-sky-700 shadow-sm ring-1 ring-sky-100">
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
                      className="group flex min-h-16 items-center justify-between gap-4 rounded-2xl border border-sky-100 bg-white/90 px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2"
                      aria-label={`Abrir material ${index + 1} no Google Drive em nova aba`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700" aria-hidden="true">
                          <BookOpen size={18} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-slate-900">Material {index + 1}</span>
                          <span className="block truncate text-xs text-slate-500">Link direto do Google Drive</span>
                        </span>
                      </span>
                      <ExternalLink className="shrink-0 text-sky-700 transition-transform group-hover:translate-x-0.5" size={18} aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="relative mt-6 rounded-2xl border border-dashed border-sky-200 bg-white/70 px-4 py-5 text-sm text-slate-600">
                Nenhum material do Google Drive está vinculado a este curso no momento.
              </div>
            )}
          </section>

          <div className="pt-4 pb-2 flex flex-col sm:flex-row items-center gap-4">
            <EnrollButton courseId={course.id} isFree={course.isFree ?? true} price={course.price} />
            <CertificateModal courseId={course.id} courseName={course.title} percentage={progressPercentage} />
          </div>

          <div className="pt-6 border-t border-gray-200"><h2 className="text-2xl font-bold text-gray-900 mb-6">Módulos e Aulas do Curso</h2><CourseModulesList courseId={course.id} userId={user?.id ? Number(user.id) : undefined} /></div>
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
          <p className="text-gray-600">Carregando curso...</p>
        </div>
      }
    >
      <CourseDetail courseId={parseInt(id)} />
    </Suspense>
  );
}
