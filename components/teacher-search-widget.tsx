"use client";

import { useState, useMemo } from "react";
import { Search, BookOpen, Users, ArrowRight, X, Sparkles } from "lucide-react";
import Link from "next/link";

interface CourseItem {
  id: number;
  title: string;
  level: string;
  modules?: number | null;
  category?: string | null;
}

interface StudentItem {
  id: number;
  name: string | null;
  email: string | null;
  role: string;
  lastSignedIn: string | Date;
}

interface TeacherSearchWidgetProps {
  courses: CourseItem[];
  students: StudentItem[];
}

export function TeacherSearchWidget({ courses, students }: TeacherSearchWidgetProps) {
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "courses" | "students">("all");

  const filteredCourses = useMemo(() => {
    if (filterType === "students") return [];
    const q = query.toLowerCase().trim();
    if (!q) return courses.slice(0, 5);
    return courses.filter(
      (c) => c.title.toLowerCase().includes(q) || c.level.toLowerCase().includes(q) || (c.category && c.category.toLowerCase().includes(q))
    );
  }, [courses, query, filterType]);

  const filteredStudents = useMemo(() => {
    if (filterType === "courses") return [];
    const q = query.toLowerCase().trim();
    if (!q) return students.slice(0, 5);
    return students.filter(
      (s) => (s.name && s.name.toLowerCase().includes(q)) || (s.email && s.email.toLowerCase().includes(q))
    );
  }, [students, query, filterType]);

  return (
    <div className="surface-card p-6 sm:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Search className="text-red-600" size={20} /> Motor de Busca Acadêmica
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Busque rapidamente por cursos, materiais ou alunos específicos em tempo real.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${filterType === "all" ? "bg-red-600 text-white shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterType("courses")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${filterType === "courses" ? "bg-red-600 text-white shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            Apenas Cursos
          </button>
          <button
            onClick={() => setFilterType("students")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${filterType === "students" ? "bg-red-600 text-white shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            Apenas Alunos
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
          placeholder="Digite o nome do curso, nível (ex: B1) ou nome/email do aluno..."
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

      {query && (
        <div className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
          <Sparkles size={14} className="text-red-600" />
          <span>Resultados para &quot;{query}&quot;</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cursos Encontrados */}
        {filterType !== "students" && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <BookOpen size={14} className="text-red-600" /> Cursos Correspondentes ({filteredCourses.length})
            </h3>
            {filteredCourses.length === 0 ? (
              <p className="text-xs text-muted-foreground p-4 bg-muted/30 rounded-xl border border-border/50">Nenhum curso encontrado.</p>
            ) : (
              <div className="space-y-2">
                {filteredCourses.map((c) => (
                  <div key={c.id} className="p-3.5 rounded-xl border border-border/70 bg-muted/40 flex items-center justify-between hover:border-red-300 transition">
                    <div>
                      <h4 className="text-xs font-black text-foreground">{c.title}</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Nível {c.level} {c.category ? `• ${c.category}` : ""}</p>
                    </div>
                    <Link
                      href={`/cursos/${c.id}`}
                      className="px-3 py-1.5 rounded-lg bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white transition text-xs font-bold flex items-center gap-1"
                    >
                      Ver <ArrowRight size={14} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Alunos Encontrados */}
        {filterType !== "courses" && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Users size={14} className="text-red-600" /> Alunos Correspondentes ({filteredStudents.length})
            </h3>
            {filteredStudents.length === 0 ? (
              <p className="text-xs text-muted-foreground p-4 bg-muted/30 rounded-xl border border-border/50">Nenhum aluno encontrado.</p>
            ) : (
              <div className="space-y-2">
                {filteredStudents.map((s) => (
                  <div key={s.id} className="p-3.5 rounded-xl border border-border/70 bg-muted/40 flex items-center justify-between hover:border-red-300 transition">
                    <div>
                      <h4 className="text-xs font-black text-foreground">{s.name || "Aluno sem nome"}</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{s.email}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-red-600/10 text-red-600 uppercase">
                      {s.role}
                    </span>
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
