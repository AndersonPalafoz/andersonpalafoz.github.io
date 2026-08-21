"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BarChart3, BookOpen, FileText, Users, Loader, Award, ShieldCheck, GraduationCap } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { AdminSearchWidget } from "@/components/admin-search-widget";
import { StudentStyleDashboardStats } from "@/components/student-style-dashboard-stats";

interface Stats {
  totalCourses: number;
  totalMaterials: number;
  totalArticles: number;
  totalUsers: number;
  totalEnrollments: number;
  roleCounts: {
    admin: number;
    professor: number;
    student: number;
  };
  monthlyActivity: Array<{
    month: string;
    enrollments: number;
    activeUsers: number;
    coursesCreated?: number;
  }>;
}

function MonthlyActivityChart({ data }: { data: Stats["monthlyActivity"] }) {
  const maxValue = Math.max(1, ...data.flatMap((item) => [item.enrollments, item.coursesCreated || 0]));
  const chartHeight = 200;
  const chartWidth = 720;
  const groupWidth = data.length > 0 ? chartWidth / data.length : chartWidth;

  return (
    <div className="w-full overflow-x-auto py-2">
      <div className="min-w-[600px]">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`} className="w-full h-auto">
          <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="currentColor" className="text-border" strokeWidth="1" />
          {data.map((item, index) => {
            const barWidth = Math.min(26, groupWidth / 3);
            const enrHeight = (item.enrollments / maxValue) * (chartHeight - 20);
            const courseHeight = ((item.coursesCreated || 0) / maxValue) * (chartHeight - 20);

            return (
              <g key={index} transform={`translate(${index * groupWidth}, 0)`}>
                {/* Barra de Matrículas */}
                <rect
                  x={groupWidth / 2 - barWidth - 6}
                  y={chartHeight - enrHeight}
                  width={barWidth}
                  height={enrHeight}
                  rx="6"
                  className="fill-red-600 transition-all duration-300 hover:fill-red-700"
                />
                <text x={groupWidth / 2 - barWidth / 6} y={chartHeight - enrHeight - 6} textAnchor="middle" className="text-[9px] fill-foreground font-bold">
                  {item.enrollments > 0 ? item.enrollments : ""}
                </text>

                {/* Barra de Cursos Criados */}
                <rect
                  x={groupWidth / 2 + 6}
                  y={chartHeight - courseHeight}
                  width={barWidth}
                  height={courseHeight}
                  rx="6"
                  className="fill-blue-600 transition-all duration-300 hover:fill-blue-700"
                />
                <text x={groupWidth / 2 + barWidth + 6} y={chartHeight - courseHeight - 6} textAnchor="middle" className="text-[9px] fill-foreground font-bold">
                  {(item.coursesCreated || 0) > 0 ? item.coursesCreated : ""}
                </text>

                <text x={groupWidth / 2} y={chartHeight + 24} textAnchor="middle" className="text-[11px] fill-muted-foreground font-black uppercase tracking-wider">
                  {item.month}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="flex items-center justify-center gap-8 mt-6 text-xs font-bold text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-red-600 inline-block shadow-xs" /> Matrículas Realizadas
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-blue-600 inline-block shadow-xs" /> Cursos Criados
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "admin") {
      redirect("/");
      return;
    }

    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/admin/stats", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Não foi possível carregar as estatísticas administrativas.");
        setStats(json);
      } catch (err) {
        console.error("Error loading admin stats:", err);
        setError(err instanceof Error ? err.message : "Não foi possível carregar as estatísticas administrativas.");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [user, authLoading]);

  if (authLoading || (loading && !stats)) {
    return (
      <div className="site-shell flex items-center justify-center px-4">
        <Loader className="animate-spin text-red-600" size={32} />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="site-shell page-container py-12">
        <div role="alert" className="surface-card border border-red-200 bg-red-50 p-6 text-red-900">
          <h1 className="text-lg font-black">Não foi possível carregar os dados administrativos</h1>
          <p className="mt-2 text-sm">{error}</p>
          <button type="button" onClick={() => window.location.reload()} className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700">Tentar novamente</button>
        </div>
      </div>
    );
  }

  return (
    <div className="site-shell px-4 py-8 sm:px-6 lg:px-8">
      <div className="page-container space-y-8">
        {/* Header Harmonizado com o Painel do Professor */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 surface-card p-6 sm:p-8 rounded-3xl shadow-sm border border-border/70 bg-card">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/40 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-red-600 dark:text-red-400">
              <ShieldCheck size={16} />
              Governança Global & Administração
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">Painel do Administrador</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Visão geral, controle total do ecossistema acadêmico, gerenciamento de cursos, lixeira e auditoria de acessos.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0">
            <Link
              href="/admin/relatorios-academicos"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs sm:text-sm font-bold text-red-700 transition hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300 shadow-sm"
            >
              Relatórios & Classroom
            </Link>
            <Link
              href="/admin/medalhas"
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-xs sm:text-sm font-bold text-foreground transition hover:border-red-200 hover:bg-muted shadow-sm"
            >
              Conceder Medalhas
            </Link>
            <Link
              href="/admin/cms"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs sm:text-sm font-bold text-red-700 transition hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300 shadow-sm"
            >
              CMS & Logo
            </Link>
            <Link
              href="/admin/auditoria"
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-xs sm:text-sm font-bold text-foreground transition hover:border-red-200 hover:bg-muted shadow-sm"
            >
              Auditoria
            </Link>
            <Link
              href="/admin/certificados"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs sm:text-sm font-bold text-red-700 transition hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300 shadow-sm"
            >
              Assinar Certificados
            </Link>
            <Link
              href="/admin/cupons"
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-xs sm:text-sm font-bold text-foreground transition hover:border-red-200 hover:bg-muted shadow-sm"
            >
              Cupons
            </Link>
            <Link
              href="/admin/cursos"
              className="rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-bold text-primary-foreground shadow-sm shadow-red-600/20 transition hover:-translate-y-0.5 hover:bg-primary/90"
            >
              Gerenciar Cursos & Lixeira
            </Link>
          </div>
        </div>

        {/* Painel Estatístico Estilo Dashboard do Aluno com Skeleton */}
        <StudentStyleDashboardStats
          coursesCount={stats?.totalCourses || 0}
          studentsCount={stats?.totalUsers || 0}
          materialsCount={stats?.totalMaterials || 0}
          enrollmentsCount={stats?.totalEnrollments || 0}
          isLoading={loading && !stats}
        />

        {/* Admin Unified Search Widget */}
        <div className="surface-card p-6 sm:p-8 space-y-4">
          <h2 className="text-base font-black text-foreground">Busca Administrativa Ampliada</h2>
          <p className="text-xs text-muted-foreground">
            Pesquise instantaneamente por professores, alunos e cursos cadastrados no sistema.
          </p>
          <AdminSearchWidget />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cursos Publicados</p>
              <BookOpen className="text-red-600" size={20} />
            </div>
            <p className="text-3xl font-black text-foreground mt-2">{stats?.totalCourses || 0}</p>
          </div>
          <div className="surface-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Materiais & PDFs</p>
              <FileText className="text-blue-600" size={20} />
            </div>
            <p className="text-3xl font-black text-foreground mt-2">{stats?.totalMaterials || 0}</p>
          </div>
          <div className="surface-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Usuários Ativos</p>
              <Users className="text-emerald-600" size={20} />
            </div>
            <p className="text-3xl font-black text-foreground mt-2">{stats?.totalUsers || 0}</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              {stats?.roleCounts.professor || 0} prof(s) · {stats?.roleCounts.student || 0} aluno(s)
            </p>
          </div>
          <div className="surface-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Matrículas Totais</p>
              <Award className="text-amber-600" size={20} />
            </div>
            <p className="text-3xl font-black text-foreground mt-2">{stats?.totalEnrollments || 0}</p>
          </div>
        </div>

        {/* Gráfico Interativo de Evolução de Matrículas e Cursos Criados */}
        <div className="surface-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <BarChart3 className="text-red-600" size={20} /> Evolução de Matrículas e Cursos Criados por Mês
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Comparativo mensal entre o volume de matrículas de alunos e a criação de novos cursos no ecossistema.
              </p>
            </div>
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600">
              Banco de Dados Neon PostgreSQL
            </span>
          </div>

          {stats?.monthlyActivity && stats.monthlyActivity.length > 0 ? (
            <div className="pt-2">
              <MonthlyActivityChart data={stats.monthlyActivity} />
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground text-xs font-semibold">
              Nenhum dado de atividade mensal registrado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
