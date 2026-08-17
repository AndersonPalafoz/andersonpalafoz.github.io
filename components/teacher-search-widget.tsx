"use client";

import { useState, useMemo } from "react";
import { Search, BookOpen, Users, ArrowRight, X, Filter, Calendar } from "lucide-react";
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
  approvalStatus?: string | null;
  lastSignedIn: string | Date;
  createdAt?: string | Date;
}

interface TeacherSearchWidgetProps {
  courses: CourseItem[];
  students: StudentItem[];
}

export function TeacherSearchWidget({ courses, students }: TeacherSearchWidgetProps) {
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "courses" | "students">("all");
  
  // Advanced filters for students
  const [statusFilter, setStatusFilter] = useState<string>("all"); // all, approved, pending, rejected
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all"); // all, today, week, month

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
    
    return students.filter((s) => {
      // Text query match
      const matchesQuery = !q || 
        (s.name && s.name.toLowerCase().includes(q)) || 
        (s.email && s.email.toLowerCase().includes(q));

      if (!matchesQuery) return false;

      // Status match
      if (statusFilter !== "all" && s.approvalStatus !== statusFilter) {
        return false;
      }

      // Date range match (based on lastSignedIn or createdAt)
      if (dateRangeFilter !== "all") {
        const studentDate = new Date(s.lastSignedIn || s.createdAt || Date.now()).getTime();
        const now = Date.now();
        const diffDays = (now - studentDate) / (1000 * 60 * 60 * 24);

        if (dateRangeFilter === "today" && diffDays > 1) return false;
        if (dateRangeFilter === "week" && diffDays > 7) return false;
        if (dateRangeFilter === "month" && diffDays > 30) return false;
      }

      return true;
    });
  }, [students, query, filterType, statusFilter, dateRangeFilter]);

  const clearFilters = () => {
    setQuery("");
    setFilterType("all");
    setStatusFilter("all");
    setDateRangeFilter("all");
  };

  const hasActiveFilters = query || filterType !== "all" || statusFilter !== "all" || dateRangeFilter !== "all";

  return (
    <div className="surface-card p-6 sm:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Search className="text-red-600" size={20} /> Motor de Busca & Filtros Avançados
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Filtre cursos e alunos por termo, status de aprovação e período de atividade em tempo real.
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
            Cursos
          </button>
          <button
            onClick={() => setFilterType("students")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${filterType === "students" ? "bg-red-600 text-white shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            Alunos
          </button>
        </div>
      </div>

      {/* Barra de Pesquisa Principal */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-muted-foreground">
          <Search size={18} />
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busque por título do curso, nível (ex: B1), nome ou email do aluno..."
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

      {/* Filtros Avançados (Status e Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-muted/50 border border-border/60">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
            <Filter size={13} /> Status do Aluno
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="all">Todos os Status</option>
            <option value="approved">Aprovados</option>
            <option value="pending">Pendentes</option>
            <option value="rejected">Rejeitados</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
            <Calendar size={13} /> Período de Atividade
          </label>
          <select
            value={dateRangeFilter}
            onChange={(e) => setDateRangeFilter(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="all">Qualquer Data</option>
            <option value="today">Últimas 24 horas</option>
            <option value="week">Últimos 7 dias</option>
            <option value="month">Últimos 30 dias</option>
          </select>
        </div>

        <div className="flex items-end">
          {hasActiveFilters ? (
            <button
              onClick={clearFilters}
              className="w-full py-2 px-4 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <X size={14} /> Limpar Filtros
            </button>
          ) : (
            <div className="w-full py-2 px-4 text-center text-xs text-muted-foreground font-medium">
              Nenhum filtro ativo
            </div>
          )}
        </div>
      </div>

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
              <p className="text-xs text-muted-foreground p-4 bg-muted/30 rounded-xl border border-border/50">Nenhum aluno encontrado para os filtros selecionados.</p>
            ) : (
              <div className="space-y-2">
                {filteredStudents.map((s) => (
                  <div key={s.id} className="p-3.5 rounded-xl border border-border/70 bg-muted/40 flex items-center justify-between hover:border-red-300 transition">
                    <div>
                      <h4 className="text-xs font-black text-foreground">{s.name || "Aluno sem nome"}</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{s.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600/10 text-red-600 uppercase">
                        {s.approvalStatus || s.role}
                      </span>
                    </div>
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
