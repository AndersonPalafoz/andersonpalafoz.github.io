"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BarChart3, BookOpen, FileText, Users, Loader, Award } from "lucide-react";
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
  }>;
}

function MonthlyActivityChart({ data }: { data: Stats["monthlyActivity"] }) {
  const maxValue = Math.max(1, ...data.flatMap((item) => [item.enrollments, item.activeUsers]));
  const chartHeight = 180;
  const chartWidth = 720;
  const groupWidth = data.length > 0 ? chartWidth / data.length : chartWidth;

  return (
    <div className="w-full overflow-x-auto py-2">
      <div className="min-w-[600px]">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`} className="w-full h-auto">
          <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="currentColor" className="text-border" strokeWidth="1" />
          {data.map((item, index) => {
            const barWidth = Math.min(24, groupWidth / 3);
            const enrHeight = (item.enrollments / maxValue) * (chartHeight - 20);
            const actHeight = (item.activeUsers / maxValue) * (chartHeight - 20);

            return (
              <g key={index} transform={`translate(${index * groupWidth}, 0)`}>
                <rect
                  x={groupWidth / 2 - barWidth - 4}
                  y={chartHeight - enrHeight}
                  width={barWidth}
                  height={enrHeight}
                  rx="4"
                  className="fill-red-600 transition-all duration-300 hover:fill-red-700"
                />
                <rect
                  x={groupWidth / 2 + 4}
                  y={chartHeight - actHeight}
                  width={barWidth}
                  height={actHeight}
                  rx="4"
                  className="fill-blue-600 transition-all duration-300 hover:fill-blue-700"
                />
                <text x={groupWidth / 2} y={chartHeight + 20} textAnchor="middle" className="text-[10px] fill-muted-foreground font-bold">
                  {item.month}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="flex items-center justify-center gap-6 mt-4 text-xs font-bold text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-600 inline-block" /> Matrículas / Alunos
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> Sessões Ativas
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
    <div className="site-shell">
      <div className="bg-primary text-primary-foreground px-4 py-8 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Painel do Administrador</h1>
            <p className="text-red-100 text-xs sm:text-sm mt-1">
              Visão geral e governança completa do ecossistema acadêmico.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/admin/relatorios-academicos"
              className="rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 text-xs font-bold text-white transition border border-white/20"
            >
              Relatórios Acadêmicos & Classroom
            </Link>
            <Link
              href="/admin/medalhas"
              className="rounded-xl bg-red-600 hover:bg-red-700 px-4 py-2 text-xs font-bold text-white transition shadow-md"
            >
              Conceder Medalhas
            </Link>
            <Link
              href="/admin/cms"
              className="rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 text-xs font-bold text-white transition border border-white/20"
            >
              CMS & Seletor de Logo
            </Link>
            <Link
              href="/admin/auditoria"
              className="rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 text-xs font-bold text-white transition border border-white/20"
            >
              Auditoria de Acessos
            </Link>
            <Link
              href="/admin/cupons"
              className="rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 text-xs font-bold text-white transition border border-white/20"
            >
              Cupons e Descontos
            </Link>
            <Link
              href="/admin/liberacao-acesso"
              className="rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 text-xs font-bold text-white transition border border-white/20"
            >
              Liberação de Acesso Pago
            </Link>
          </div>
        </div>
      </div>

      <div className="page-container py-8 sm:py-12 space-y-8">
        {/* Painel Estatístico Estilo Dashboard do Aluno */}
        <StudentStyleDashboardStats
          coursesCount={stats?.totalCourses || 0}
          studentsCount={stats?.totalUsers || 0}
          materialsCount={stats?.totalMaterials || 0}
          enrollmentsCount={stats?.totalEnrollments || 0}
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

        {/* Gráfico de Barras de Evolução de Matrículas ao Longo do Tempo */}
        <div className="surface-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <BarChart3 className="text-red-600" size={20} /> Evolução de Matrículas Acadêmicas por Mês
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Visualização detalhada do crescimento das matrículas e engajamento dos alunos na plataforma.
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
              Nenhum dado de matrícula registrado nos últimos meses.
            </div>
          )}
        </div>

        {/* Monthly Activity Chart */}
        <div className="surface-card p-6 sm:p-8 space-y-4">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="text-red-600" size={18} /> Resumo Geral de Atividade do Sistema
          </h3>
          <p className="text-xs text-muted-foreground">
            Visão consolidade comparativa entre novas matrículas e sessões ativas registradas.
          </p>
          {stats?.monthlyActivity && stats.monthlyActivity.length > 0 ? (
            <MonthlyActivityChart data={stats.monthlyActivity} />
          ) : (
            <p className="text-xs text-muted-foreground py-8 text-center">Nenhum dado de atividade mensal registrado.</p>
          )}
        </div>
      </div>
    </div>
  );
}
