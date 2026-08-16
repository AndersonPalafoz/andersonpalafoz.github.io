"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Filter, Layers, Search } from "lucide-react";
import { WishlistToggle } from "@/components/course-engagement";

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
      return matchesQuery && matchesLevel && matchesCategory;
    });
  }, [courses, searchQuery, selectedLevel, selectedCategory]);

  return (
    <>
      <div className="mb-10 rounded-2xl border border-gray-200 bg-gray-50 p-5 shadow-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-3.5 text-gray-400" size={19} />
          <label htmlFor="course-search" className="sr-only">Pesquisar cursos</label>
          <input
            id="course-search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Pesquisar por curso, nível ou categoria..."
            className="h-12 w-full rounded-xl border border-gray-300 bg-white pl-11 pr-4 text-sm text-gray-900 outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-100"
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="mr-1 inline-flex items-center gap-1 text-xs font-black uppercase tracking-wide text-gray-500"><Filter size={14} /> Nível</span>
          {["all", ...levels].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setSelectedLevel(level)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${selectedLevel === level ? "bg-red-600 text-white" : "bg-white text-gray-700 hover:bg-red-50 hover:text-red-700"}`}
            >
              {level === "all" ? "Todos" : level}
            </button>
          ))}
          {categories.length > 0 && (
            <>
              <span className="ml-2 mr-1 text-xs font-black uppercase tracking-wide text-gray-500">Categoria</span>
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                aria-label="Filtrar cursos por categoria"
                className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 outline-none focus:border-red-600"
              >
                <option value="all">Todas</option>
                {categories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </>
          )}
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between gap-3">
        <h3 className="text-xl font-black text-gray-900">{filteredCourses.length} curso(s) disponível(is)</h3>
        {(searchQuery || selectedLevel !== "all" || selectedCategory !== "all") && (
          <button type="button" onClick={() => { setSearchQuery(""); setSelectedLevel("all"); setSelectedCategory("all"); }} className="text-xs font-black uppercase tracking-wide text-red-600 hover:underline">Limpar filtros</button>
        )}
      </div>

      {filteredCourses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center">
          <Search className="mx-auto mb-3 text-gray-300" size={40} />
          <p className="font-bold text-gray-700">Nenhum curso corresponde aos filtros atuais.</p>
          <p className="mt-1 text-sm text-gray-500">Tente outro termo ou remova algum filtro.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => {
            const hasAccess = enrolled.has(course.id);
            const wasPurchased = purchased.has(course.id);
            return (
              <article key={course.id} className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 transition duration-300 hover:-translate-y-1 hover:border-red-600 hover:shadow-lg">
                <div className="bg-red-600 text-white">
                  {course.imageUrl ? <img src={course.imageUrl} alt={`Capa do curso ${course.title}`} className="h-40 w-full object-cover" /> : <div className="h-3 bg-red-700" />}
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-4xl font-black">{course.level}</div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black">{course.isFree ? "Gratuito" : "Pago"}</span>
                        <WishlistToggle courseId={course.id} initialSaved={wishlist.has(course.id)} />
                      </div>
                    </div>
                    <h4 className="mt-2 text-2xl font-black">{course.title}</h4>
                    {course.category && <p className="mt-1 text-xs font-bold uppercase tracking-wide text-red-100">{course.category}</p>}
                  </div>
                </div>
                <div className="flex flex-1 flex-col space-y-6 p-8">
                  <p className="flex-1 text-gray-600">{course.description || "Curso estruturado de inglês com metodologia ESA."}</p>
                  <div className="flex items-center gap-3 text-gray-700"><Layers size={18} className="text-red-600" /><span>{course.modules ?? 0} módulos</span></div>
                  <div className="space-y-3 border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between gap-3"><span className={`text-sm font-black ${course.isFree ? "text-emerald-700" : "text-amber-700"}`}>{course.isFree ? "Acesso gratuito" : `R$ ${Number(course.price || 0).toFixed(2).replace(".", ",")}`}</span>{hasAccess && <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-black text-emerald-700">{wasPurchased ? "Comprado" : "Acesso liberado"}</span>}</div>
                    <Link href={`/cursos/${course.id}`} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-bold text-white transition hover:bg-red-700">{hasAccess ? "Continuar curso" : "Ver Curso"}<ArrowRight size={18} /></Link>
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
