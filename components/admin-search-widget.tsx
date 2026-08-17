"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, BookOpen, Users, GraduationCap, ArrowRight, X, Loader2 } from "lucide-react";
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

export function AdminSearchWidget() {
  const [query, setQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<"all" | "teachers" | "students" | "courses">("all");
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

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
    if (!q) return teachers.slice(0, 5);
    return teachers.filter(
      (t) => (t.name && t.name.toLowerCase().includes(q)) || (t.email && t.email.toLowerCase().includes(q))
    );
  }, [teachers, query, filterCategory]);

  const filteredStudents = useMemo(() => {
    if (filterCategory === "teachers" || filterCategory === "courses") return [];
    const q = query.toLowerCase().trim();
    if (!q) return students.slice(0, 5);
    return students.filter(
      (s) => (s.name && s.name.toLowerCase().includes(q)) || (s.email && s.email.toLowerCase().includes(q))
    );
  }, [students, query, filterCategory]);

  const filteredCourses = useMemo(() => {
    if (filterCategory === "teachers" || filterCategory === "students") return [];
    const q = query.toLowerCase().trim();
    if (!q) return courses.slice(0, 5);
    return courses.filter(
      (c) => c.title.toLowerCase().includes(q) || c.level.toLowerCase().includes(q) || (c.category && c.category.toLowerCase().includes(q))
    );
  }, [courses, query, filterCategory]);

  const clearSearch = () => {
    setQuery("");
    setFilterCategory("all");
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
            <Search className="text-red-600" size={20} /> Motor de Busca Ampliado (Professores, Alunos e Cursos)
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Pesquise instantaneamente em todo o banco de dados institucional.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${filterCategory === "all" ? "bg-red-600 text-white shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterCategory("teachers")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${filterCategory === "teachers" ? "bg-red-600 text-white shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            Professores ({teachers.length})
          </button>
          <button
            onClick={() => setFilterCategory("students")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${filterCategory === "students" ? "bg-red-600 text-white shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            Alunos ({students.length})
          </button>
          <button
            onClick={() => setFilterCategory("courses")}
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
          onChange={(e) => setQuery(e.target.value)}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Professores */}
        {filterCategory !== "students" && filterCategory !== "courses" && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <GraduationCap size={14} className="text-red-600" /> Professores ({filteredTeachers.length})
            </h3>
            {filteredTeachers.length === 0 ? (
              <p className="text-xs text-muted-foreground p-4 bg-muted/30 rounded-xl border border-border/50">Nenhum professor encontrado.</p>
            ) : (
              <div className="space-y-2">
                {filteredTeachers.map((t) => (
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
        )}

        {/* Alunos */}
        {filterCategory !== "teachers" && filterCategory !== "courses" && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Users size={14} className="text-red-600" /> Alunos ({filteredStudents.length})
            </h3>
            {filteredStudents.length === 0 ? (
              <p className="text-xs text-muted-foreground p-4 bg-muted/30 rounded-xl border border-border/50">Nenhum aluno encontrado.</p>
            ) : (
              <div className="space-y-2">
                {filteredStudents.map((s) => (
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
        )}

        {/* Cursos */}
        {filterCategory !== "teachers" && filterCategory !== "students" && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <BookOpen size={14} className="text-red-600" /> Cursos ({filteredCourses.length})
            </h3>
            {filteredCourses.length === 0 ? (
              <p className="text-xs text-muted-foreground p-4 bg-muted/30 rounded-xl border border-border/50">Nenhum curso encontrado.</p>
            ) : (
              <div className="space-y-2">
                {filteredCourses.map((c) => (
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
        )}
      </div>
    </div>
  );
}
