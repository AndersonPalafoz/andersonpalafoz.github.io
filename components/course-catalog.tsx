"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Filter, Layers, Search, BookOpen } from "lucide-react";
import { WishlistToggle } from "@/components/course-engagement";
import { COURSE_TYPE_OPTIONS, getCourseTypeDefinition, getSyncModalityLabel, normalizeCourseType } from "@/lib/course-types";

type CatalogCourse = {
  id: number;
  level: string;
  title: string;
  description: string | null;
  modules: number | null;
  imageUrl: string | null;
  isFree: boolean;
  price: string | number | null;
  category: string | null;
  courseType?: number | null;
  externalRedirectUrl?: string | null;
  syncModality?: string | null;
};

export function CourseCatalog({
  courses,
  purchasedCourseIds,
  enrolledCourseIds,
  wishlistCourseIds,
}: {
  courses: CatalogCourse[];
  purchasedCourseIds: number[];
  enrolledCourseIds: number[];
  wishlistCourseIds: number[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCourseType, setSelectedCourseType] = useState("all");

  const levels = useMemo(() => Array.from(new Set(courses.map((course) => course.level))).sort(), [courses]);
  const categories = useMemo(
    () => Array.from(new Set(courses.map((course) => course.category).filter(Boolean) as string[])).sort(),
    [courses],
  );
  const purchased = useMemo(() => new Set(purchasedCourseIds), [purchasedCourseIds]);
  const enrolled = useMemo(() => new Set(enrolledCourseIds), [enrolledCourseIds]);
  const wishlist = useMemo(() => new Set(wishlistCourseIds), [wishlistCourseIds]);
  const filteredCourses = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    return courses.filter((course) => {
      const matchesQuery = !query || [course.title, course.description, course.category, course.level]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase().includes(query));
      const matchesLevel = selectedLevel === "all" || course.level === selectedLevel;
      const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
      const matchesCourseType = selectedCourseType === "all" || String(normalizeCourseType(course.courseType)) === selectedCourseType;
      return matchesQuery && matchesLevel && matchesCategory && matchesCourseType;
    });
  }, [courses, searchQuery, selectedLevel, selectedCategory, selectedCourseType]);

  return (
    <>
      <div className="surface-card mb-10 p-5 sm:p-6">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-3.5 text-muted-foreground" size={19} />
          <label htmlFor="course-search" className="sr-only">Pesquisar cursos</label>
          <input
            id="course-search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Pesquisar por curso, nível ou categoria..."
            className="field-control h-12 pl-11 pr-4"
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="mr-1 inline-flex items-center gap-1 text-xs font-black uppercase tracking-wide text-muted-foreground"><Filter size={14} /> Nível</span>
          {["all", ...levels].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setSelectedLevel(level)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 ${selectedLevel === level ? "bg-red-600 text-white" : "bg-card text-muted-foreground hover:bg-red-50 hover:text-red-700"}`}
            >
              {level === "all" ? "Todos" : level}
            </button>
          ))}
          <span className="ml-2 mr-1 text-xs font-black uppercase tracking-wide text-muted-foreground">Tipo</span>
          <select
            value={selectedCourseType}
            onChange={(event) => setSelectedCourseType(event.target.value)}
            aria-label="Filtrar cursos por tipo"
            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/15"
          >
            <option value="all">Todos os tipos</option>
            {COURSE_TYPE_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.shortLabel}</option>)}
          </select>
          {categories.length > 0 && (
            <>
              <span className="ml-2 mr-1 text-xs font-black uppercase tracking-wide text-muted-foreground">Categoria</span>
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                aria-label="Filtrar cursos por categoria"
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/15"
              >
                <option value="all">Todas</option>
                {categories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </>
          )}
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between gap-3">
        <h3 className="text-xl font-black text-foreground">{filteredCourses.length} curso(s) disponível(is)</h3>
        {(searchQuery || selectedLevel !== "all" || selectedCategory !== "all" || selectedCourseType !== "all") && (
          <button type="button" onClick={() => { setSearchQuery(""); setSelectedLevel("all"); setSelectedCategory("all"); setSelectedCourseType("all"); }} className="text-xs font-black uppercase tracking-wide text-red-600 hover:underline">Limpar filtros</button>
        )}
      </div>

      {filteredCourses.length === 0 ? (
        <div className="empty-state px-6 py-16 text-center">
          <Search className="mx-auto mb-3 text-muted-foreground" size={40} />
          <p className="font-bold text-foreground">Nenhum curso corresponde aos filtros atuais.</p>
          <p className="mt-1 text-sm text-muted-foreground">Tente outro termo ou remova algum filtro.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => {
            const hasAccess = enrolled.has(course.id);
            const courseType = getCourseTypeDefinition(course.courseType);
            const syncLabel = getSyncModalityLabel(course.syncModality);
            const wasPurchased = purchased.has(course.id);
            return (
              <article key={course.id} className="surface-card interactive-card group flex flex-col overflow-hidden">
                <div className="bg-red-600 text-white">
                  {course.imageUrl ? <img src={course.imageUrl} alt={`Capa do curso ${course.title}`} className="h-40 w-full object-cover" /> : <div className="h-3 bg-red-700" />}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <span
                            aria-label={`Tipo de curso: ${courseType.label}`}
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide shadow-sm ${courseType.className}`}
                          >
                            <BookOpen size={12} aria-hidden="true" /> {courseType.tag}
                          </span>
                          <span aria-label="Origem: Curso interno" className="inline-flex items-center rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white">Curso interno</span>
                        </div>
                        <div className="mt-2 text-4xl font-black">{course.level}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black">{course.isFree ? "Gratuito" : "Pago"}</span>
                        <WishlistToggle courseId={course.id} initialSaved={wishlist.has(course.id)} />
                      </div>
                    </div>
                    <h4 className="mt-2 text-2xl font-black">{course.title}</h4>
                    {course.category && <p className="mt-1 text-xs font-bold uppercase tracking-wide text-red-100">{course.category}</p>}
                  </div>
                </div>
                <div className="flex flex-1 flex-col space-y-6 p-6 sm:p-8">
                  <p className="flex-1 text-muted-foreground">{course.description || "Curso estruturado de inglês com metodologia ESA."}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-muted-foreground">
                    <span className="inline-flex items-center gap-2"><Layers size={18} className="text-red-600" />{course.modules ?? 0} módulos</span>
                    <span className="rounded-full border border-border px-2.5 py-1">{courseType.shortLabel}</span>
                    {courseType.supportsSync && <span className="rounded-full border border-border px-2.5 py-1">{syncLabel}</span>}
                  </div>
                  <div className="space-y-3 border-t border-border/70 pt-6">
                    <div className="flex items-center justify-between gap-3"><span className={`text-sm font-black ${course.isFree ? "text-emerald-700" : "text-amber-700"}`}>{course.isFree ? "Acesso gratuito" : `R$ ${Number(course.price || 0).toFixed(2).replace(".", ",")}`}</span>{hasAccess && <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-black text-emerald-700">{wasPurchased ? "Comprado" : "Acesso liberado"}</span>}</div>
                    <Link href={`/cursos/${course.id}`} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-bold text-white transition hover:bg-red-700">{hasAccess ? "Continuar curso" : "Ver Curso"}<ArrowRight size={18} /></Link>
                    {course.externalRedirectUrl && (course.courseType === 1 || course.courseType === 4) && <p className="text-center text-[11px] font-semibold text-muted-foreground">Inclui acesso a ambiente externo autorizado</p>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
