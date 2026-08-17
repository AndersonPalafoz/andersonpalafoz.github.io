import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BarChart3, BookOpen, FileText, Users, Loader, Award } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { AdminSearchWidget } from "@/components/admin-search-widget";

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
    <div className="mt-6 rounded-2xl border border-border/70 bg-muted/60 p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-foreground">Evolução dos últimos 6 meses</h3>
          <p className="text-xs text-muted-foreground">Matrículas e usuários com acesso registrado no período.</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground" aria-label="Legenda do gráfico">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-600" /> Matrículas</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Usuários ativos</span>
        </div>
      </div>

      {data.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Ainda não há dados mensais para exibir.</p>
      ) : (
        <div className="overflow-x-auto" role="img" aria-label="Gráfico de matrículas e usuários ativos nos últimos seis meses">
          <svg viewBox={`0 0 ${chartWidth} 240`} className="h-64 min-w-[640px] w-full" preserveAspectRatio="none">
            {[0, 0.5, 1].map((ratio) => {
              const y = 18 + chartHeight * ratio;
              return <line key={ratio} x1="36" x2={chartWidth - 12} y1={y} y2={y} stroke="#e5e7eb" strokeDasharray="4 4" />;
            })}
            <line x1="36" x2={chartWidth - 12} y1={18 + chartHeight} y2={18 + chartHeight} stroke="#d1d5db" />
            {data.map((item, index) => {
              const center = 36 + groupWidth * index + groupWidth / 2;
              const barWidth = Math.min(24, groupWidth / 4);
              const enrollmentHeight = (item.enrollments / maxValue) * chartHeight;
              const activeHeight = (item.activeUsers / maxValue) * chartHeight;
              const enrollmentY = 18 + chartHeight - enrollmentHeight;
              const activeY = 18 + chartHeight - activeHeight;
              return (
                <g key={`${item.month}-${index}`}>
                  <rect x={center - barWidth - 2} y={enrollmentY} width={barWidth} height={Math.max(2, enrollmentHeight)} rx="4" fill="#dc2626">
                    <title>{`${item.month}: ${item.enrollments} matrículas`}</title>
                  </rect>
                  <rect x={center + 2} y={activeY} width={barWidth} height={Math.max(2, activeHeight)} rx="4" fill="#2563eb">
                    <title>{`${item.month}: ${item.activeUsers} usuários ativos`}</title>
                  </rect>
                  <text x={center} y="224" textAnchor="middle" fontSize="11" fill="#6b7280">{item.month}</text>
                </g>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (!user || user.role !== "admin") {
      redirect("/");
    }

    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats");
        if (!response.ok) throw new Error("Failed to fetch stats");
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, isLoading]);

  if (isLoading || loading) {
    return (
      <div className="site-shell flex items-center justify-center px-4">
        <Loader className="animate-spin" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="site-shell flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Voltar para Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="site-shell">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold">Painel Admin</h1>
        <p className="text-red-100 mt-2">Gerenciar cursos, materiais e usuários</p>
      </div>

      {/* Main Content */}
      <div className="page-container py-8 sm:py-12 space-y-12">
        {/* Atalhos e Gerenciamento */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-foreground">Atalhos Operacionais</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/admin/medalhas" className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-xs font-black text-slate-950 shadow-md transition hover:-translate-y-0.5">
              <Award size={16} /> Gestão de Medalhas
            </Link>
            <Link href="/admin/usuarios" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90">
              <Users size={16} /> Gerenciar Usuários & Permissões
            </Link>
            <Link href="/admin/relatorios-academicos" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5">
              <FileText size={16} /> Relatórios Acadêmicos & Classroom
            </Link>
          </div>
        </div>

        {/* Motor de Busca Ampliado (Admin) */}
        <AdminSearchWidget />

        {/* Stats Grid Detalhado por Função e Cursos Publicados */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="surface-card interactive-card p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Cursos Publicados</p>
                <p className="text-3xl font-black text-foreground mt-2">
                  {stats?.totalCourses || 0}
                </p>
                <p className="text-xs text-red-600 font-semibold mt-1">Disponíveis na plataforma</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <BookOpen size={24} />
              </div>
            </div>
          </div>

          <div className="surface-card interactive-card p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Alunos Registrados</p>
                <p className="text-3xl font-black text-foreground mt-2">
                  {stats?.roleCounts.student || 0}
                </p>
                <p className="text-xs text-blue-600 font-semibold mt-1">Perfil: Aluno (Student)</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users size={24} />
              </div>
            </div>
          </div>

          <div className="surface-card interactive-card p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Professores & Admins</p>
                <p className="text-3xl font-black text-foreground mt-2">
                  {(stats?.roleCounts.professor || 0) + (stats?.roleCounts.admin || 0)}
                </p>
                <p className="text-xs text-emerald-600 font-semibold mt-1">Gestão de Conteúdo</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <BarChart3 size={24} />
              </div>
            </div>
          </div>

          <div className="surface-card interactive-card p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Total de Inscrições</p>
                <p className="text-3xl font-black text-foreground mt-2">
                  {stats?.totalEnrollments || 0}
                </p>
                <p className="text-xs text-purple-600 font-semibold mt-1">Matrículas ativas</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <FileText size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Evolução mensal */}
        <section className="surface-card p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <BarChart3 size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Atividade da plataforma</h2>
              <p className="mt-1 text-sm text-muted-foreground">Acompanhe a evolução real das matrículas e dos acessos ativos para orientar decisões acadêmicas.</p>
            </div>
          </div>
          <MonthlyActivityChart data={stats?.monthlyActivity || []} />
        </section>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/cursos">
            <div className="surface-card interactive-card h-full p-6 sm:p-8">
              <BookOpen className="text-red-600 mb-4" size={40} />
              <h2 className="text-xl font-bold text-foreground mb-2">Gerenciar Cursos</h2>
              <p className="text-muted-foreground">Criar, editar e deletar cursos</p>
            </div>
          </Link>
          <Link href="/admin/materiais">
            <div className="surface-card interactive-card h-full p-6 sm:p-8">
              <FileText className="text-red-600 mb-4" size={40} />
              <h2 className="text-xl font-bold text-foreground mb-2">Gerenciar Materiais</h2>
              <p className="text-muted-foreground">Adicionar e organizar materiais públicos</p>
            </div>
          </Link>
          <Link href="/admin/usuarios">
            <div className="surface-card interactive-card h-full p-6 sm:p-8">
              <Users className="text-red-600 mb-4" size={40} />
              <h2 className="text-xl font-bold text-foreground mb-2">Gerenciar Usuários</h2>
              <p className="text-muted-foreground">Controle de permissões e acessos</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
