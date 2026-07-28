import { Suspense } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getCourseById, getModulesByCourse } from "@/lib/db";
import { EnrollButton } from "@/components/enroll-button";
import { BookOpen, Layers } from "lucide-react";

async function CourseDetail({ courseId }: { courseId: number }) {
  const course = await getCourseById(courseId);

  if (!course) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Curso não encontrado.</p>
      </div>
    );
  }

  const modules = await getModulesByCourse(courseId);

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
          <span className="inline-block bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
            {course.level}
          </span>

          <h1 className="text-4xl font-bold text-gray-900">{course.title}</h1>

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
          </div>

          {modules.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Módulos do Curso</h2>
              <ul className="space-y-4">
                {modules.map((module) => (
                  <li key={module.id} className="flex items-start gap-3">
                    <span className="text-red-600 font-bold">{module.order}.</span>
                    <div>
                      <p className="font-semibold text-gray-900">{module.title}</p>
                      {module.description && (
                        <p className="text-gray-600 text-sm">{module.description}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-4">
            <EnrollButton courseId={course.id} />
          </div>
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
