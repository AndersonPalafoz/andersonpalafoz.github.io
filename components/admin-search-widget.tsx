"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { Search, BookOpen, Users, GraduationCap, ArrowRight, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface CourseItem {
  id: number;
  title: string;
  level: string;
  modules?: number | null;
  category?: string | null;
}

interface UserItem {
  id: number;
  name: string | null;
  email: string | null;
  role: string;
  approvalStatus?: string | null;
  lastSignedIn: string | Date;
}

const ITEMS_PER_PAGE = 5;

export function AdminSearchWidget() {
  const [query, setQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<"all" | "teachers" | "students" | "courses">("all");
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Pagination states per section
  const [teacherPage, setTeacherPage] = useState(1);
  const [studentPage, setStudentPage] = useState(1);
  const [coursePage, setCoursePage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/search");
        if (!res.ok) return;
        const data = await res.json();
        setCourses(data.courses || []);
        setUsersList(data.users || []);
      } catch (err) {
        console.error("Error fetching admin search data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const teachers = useMemo(() => {
    return usersList.filter((u) => u.role === "professor" || u.role === "admin" || u.email === "palafozanderson@gmail.com");
  }, [usersList]);

  const students = useMemo(() => {
    return usersList.filter((u) => u.role === "user" || u.role === "student");
  }, [usersList]);

  const filteredTeachers = useMemo(() => {
    if (filterCategory === "students" || filterCategory === "courses") return [];
    const q = query.toLowerCase().trim();
    if (!q) return teachers;
    return teachers.filter(
      (t) => (t.name && t.name.toLowerCase().includes(q)) || (t.email && t.email.toLowerCase().includes(q))
    );
  }, [teachers, query, filterCategory]);

  const filteredStudents = useMemo(() => {
    if (filterCategory === "teachers" || filterCategory === "courses") return [];
    const q = query.toLowerCase().trim();
    if (!q) return students;
    return students.filter(
      (s) => (s.name && s.name.toLowerCase().includes(q)) || (s.email && s.email.toLowerCase().includes(q))
    );
  }, [students, query, filterCategory]);

  const filteredCourses = useMemo(() => {
    if (filterCategory === "teachers" || filterCategory === "students") return [];
    const q = query.toLowerCase().trim();
    if (!q) return courses;
    return courses.filter(
      (c) => c.title.toLowerCase().includes(q) || c.level.toLowerCase().includes(q) || (c.category && c.category.toLowerCase().includes(q))
    );
  }, [courses, query, filterCategory]);

  // Paginated slices
  const paginatedTeachers = useMemo(() => {
    const start = (teacherPage - 1) * ITEMS_PER_PAGE;
    return filteredTeachers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTeachers, teacherPage]);

  const paginatedStudents = useMemo(() => {
    const start = (studentPage - 1) * ITEMS_PER_PAGE;
    return filteredStudents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredStudents, studentPage]);

  const paginatedCourses = useMemo(() => {
    const start = (coursePage - 1) * ITEMS_PER_PAGE;
    return filteredCourses.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCourses, coursePage]);

  const handleCategoryChange = (cat: "all" | "teachers" | "students" | "courses") => {
    startTransition(() => {
      setFilterCategory(cat);
      setTeacherPage(1);
      setStudentPage(1);
      setCoursePage(1);
    });
  };

  const handleQueryChange = (val: string) => {
    startTransition(() => {
      setQuery(val);
      setTeacherPage(1);
      setStudentPage(1);
      setCoursePage(1);
    });
  };

  const clearSearch = () => {
    startTransition(() => {
      setQuery("");
      setFilterCategory("all");
      setTeacherPage(1);
      setStudentPage(1);
      setCoursePage(1);
    });
  };

  const hasActiveFilters = query || filterCategory !== "all";

  if (loading) {
    return (
      <div className="surface-card p-8 flex items-center justify-center gap-3">
        <Loader2 className="animate-spin text-red-600" size={24} />
        <span className="text-sm font-semibold text-muted-foreground">Carregando motor de busca administrativa...</span>
      </div>
    );
  }

  return (
    <div className="surface-card p-6 sm:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Search className="text-red-600" size={20} /> Motor de Busca Ampliado (Com Skeleton Loader)
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Pesquise por professores, alunos e cursos com transições suaves e paginação dinâmica.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleCategoryChange("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${filterCategory === "all" ? "bg-red-600 text-white shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            Todos
          </button>
          <button
            onClick={() => handleCategoryChange("teachers")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${filterCategory === "teachers" ? "bg-red-600 text-white shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            Professores ({teachers.length})
          </button>
          <button
            onClick={() => handleCategoryChange("students")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${filterCategory === "students" ? "bg-red-600 text-white shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            Alunos ({students.length})
          </button>
          <button
            onClick={() => handleCategoryChange("courses")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${filterCategory === "courses" ? "bg-red-600 text-white shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            Cursos ({courses.length})
          </button>
        </div>
      </div>

      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-muted-foreground">
          <Search size={18} />
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Digite o nome/email do professor ou aluno, ou título do curso..."
          className="w-full rounded-2xl border border-border bg-background pl-11 pr-10 py-3.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-red-600 shadow-sm"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground hover:text-foreground"
            title="Limpar busca"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>Filtro ativo: <strong className="text-foreground uppercase">{filterCategory}</strong></span>
          <button onClick={clearSearch} className="text-red-600 font-bold hover:underline">Limpar filtros</button>
        </div>
      )}

      {/* Grid de Seções com Skeleton Loader */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {isPending && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-xs z-10 flex items-center justify-center rounded-2xl">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border shadow-lg">
              <Loader2 className="animate-spin text-red-600" size={16} />
              <span className="text-xs font-bold text-foreground">Atualizando resultados...</span>
            </div>
          </div>
        )}

        {/* Professores */}
        {filterCategory !== "students" && filterCategory !== "courses" && (
          <div className="space-y-3 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-3">
                <GraduationCap size={14} className="text-red-600" /> Professores ({filteredTeachers.length})
              </h3>
              {isPending ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="p-3.5 rounded-xl border border-border/70 bg-muted/20 animate-pulse flex items-center justify-between">
                      <div className="space-y-1.5 w-3/4">
                        <div className="h-3.5 bg-muted rounded w-1/2" />
                        <div className="h-2.5 bg-muted rounded w-3/4" />
                      </div>
                      <div className="h-6 w-16 bg-muted rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : filteredTeachers.length === 0 ? (
                <p className="text-xs text-muted-foreground p-4 bg-muted/30 rounded-xl border border-border/50">Nenhum professor encontrado.</p>
              ) : (
                <div className="space-y-2">
                  {paginatedTeachers.map((t) => (
                    <div key={t.id} className="p-3.5 rounded-xl border border-border/70 bg-muted/40 flex items-center justify-between hover:border-red-300 transition">
                      <div>
                        <h4 className="text-xs font-black text-foreground">{t.name || "Professor"}</h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{t.email}</p>
                      </div>
                      <Link
                        href="/admin/usuarios"
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white transition text-[11px] font-bold"
                      >
                        Gerenciar
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {filteredTeachers.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs">
                <span className="text-muted-foreground">Pág. {teacherPage} de {Math.ceil(filteredTeachers.length / ITEMS_PER_PAGE)}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startTransition(() => setTeacherPage((p) => Math.max(1, p - 1)))}
                    disabled={teacherPage === 1}
                    className="p-1.5 rounded-lg border border-border bg-background disabled:opacity-40"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => startTransition(() => setTeacherPage((p) => (p * ITEMS_PER_PAGE < filteredTeachers.length ? p + 1 : p)))}
                    disabled={teacherPage * ITEMS_PER_PAGE >= filteredTeachers.length}
                    className="p-1.5 rounded-lg border border-border bg-background disabled:opacity-40"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Alunos */}
        {filterCategory !== "teachers" && filterCategory !== "courses" && (
          <div className="space-y-3 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-3">
                <Users size={14} className="text-red-600" /> Alunos ({filteredStudents.length})
              </h3>
              {isPending ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="p-3.5 rounded-xl border border-border/70 bg-muted/20 animate-pulse flex items-center justify-between">
                      <div className="space-y-1.5 w-3/4">
                        <div className="h-3.5 bg-muted rounded w-1/2" />
                        <div className="h-2.5 bg-muted rounded w-3/4" />
                      </div>
                      <div className="h-6 w-16 bg-muted rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : filteredStudents.length === 0 ? (
                <p className="text-xs text-muted-foreground p-4 bg-muted/30 rounded-xl border border-border/50">Nenhum aluno encontrado.</p>
              ) : (
                <div className="space-y-2">
                  {paginatedStudents.map((s) => (
                    <div key={s.id} className="p-3.5 rounded-xl border border-border/70 bg-muted/40 flex items-center justify-between hover:border-red-300 transition">
                      <div>
                        <h4 className="text-xs font-black text-foreground">{s.name || "Aluno"}</h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{s.email}</p>
                      </div>
                      <Link
                        href="/admin/usuarios"
                        className="px-2.5 py-1 rounded-lg bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white transition text-[11px] font-bold"
                      >
                        Gerenciar
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {filteredStudents.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs">
                <span className="text-muted-foreground">Pág. {studentPage} de {Math.ceil(filteredStudents.length / ITEMS_PER_PAGE)}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startTransition(() => setStudentPage((p) => Math.max(1, p - 1)))}
                    disabled={studentPage === 1}
                    className="p-1.5 rounded-lg border border-border bg-background disabled:opacity-40"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => startTransition(() => setStudentPage((p) => (p * ITEMS_PER_PAGE < filteredStudents.length ? p + 1 : p)))}
                    disabled={studentPage * ITEMS_PER_PAGE >= filteredStudents.length}
                    className="p-1.5 rounded-lg border border-border bg-background disabled:opacity-40"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cursos */}
        {filterCategory !== "teachers" && filterCategory !== "students" && (
          <div className="space-y-3 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-3">
                <BookOpen size={14} className="text-red-600" /> Cursos ({filteredCourses.length})
              </h3>
              {isPending ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="p-3.5 rounded-xl border border-border/70 bg-muted/20 animate-pulse flex items-center justify-between">
                      <div className="space-y-1.5 w-3/4">
                        <div className="h-3.5 bg-muted rounded w-1/2" />
                        <div className="h-2.5 bg-muted rounded w-3/4" />
                      </div>
                      <div className="h-6 w-16 bg-muted rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : filteredCourses.length === 0 ? (
                <p className="text-xs text-muted-foreground p-4 bg-muted/30 rounded-xl border border-border/50">Nenhum curso encontrado.</p>
              ) : (
                <div className="space-y-2">
                  {paginatedCourses.map((c) => (
                    <div key={c.id} className="p-3.5 rounded-xl border border-border/70 bg-muted/40 flex items-center justify-between hover:border-red-300 transition">
                      <div>
                        <h4 className="text-xs font-black text-foreground">{c.title}</h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Nível {c.level}</p>
                      </div>
                      <Link
                        href={`/cursos/${c.id}`}
                        className="px-2.5 py-1 rounded-lg bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white transition text-[11px] font-bold flex items-center gap-1"
                      >
                        Ver <ArrowRight size={12} />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {filteredCourses.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs">
                <span className="text-muted-foreground">Pág. {coursePage} de {Math.ceil(filteredCourses.length / ITEMS_PER_PAGE)}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startTransition(() => setCoursePage((p) => Math.max(1, p - 1)))}
                    disabled={coursePage === 1}
                    className="p-1.5 rounded-lg border border-border bg-background disabled:opacity-40"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => startTransition(() => setCoursePage((p) => (p * ITEMS_PER_PAGE < filteredCourses.length ? p + 1 : p)))}
                    disabled={coursePage * ITEMS_PER_PAGE >= filteredCourses.length}
                    className="p-1.5 rounded-lg border border-border bg-background disabled:opacity-40"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
