"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BarChart3, BookOpen, FileText, Users, Loader, Mail, UserPlus, Calendar } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";

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
    <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900">Evolução dos últimos 6 meses</h3>
          <p className="text-xs text-gray-500">Matrículas e usuários com acesso registrado no período.</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-gray-600" aria-label="Legenda do gráfico">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-600" /> Matrículas</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Usuários ativos</span>
        </div>
      </div>

      {data.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-500">Ainda não há dados mensais para exibir.</p>
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader className="animate-spin" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-red-600 text-white px-6 py-8">
        <h1 className="text-3xl font-bold">Painel Admin</h1>
        <p className="text-red-100 mt-2">Gerenciar cursos, materiais e usuários</p>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Atalhos e Gerenciamento */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Atalhos Operacionais</h2>
          <Link href="/admin/usuarios">
            <button className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-2">
              <Users size={16} /> Gerenciar Usuários & Permissões (/admin/usuarios)
            </button>
          </Link>
        </div>

        {/* Stats Grid Detalhado por Função e Cursos Publicados */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Cursos Publicados</p>
                <p className="text-3xl font-black text-gray-900 mt-2">
                  {stats?.totalCourses || 0}
                </p>
                <p className="text-xs text-red-600 font-semibold mt-1">Disponíveis na plataforma</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <BookOpen size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Alunos Registrados</p>
                <p className="text-3xl font-black text-gray-900 mt-2">
                  {stats?.roleCounts.student || 0}
                </p>
                <p className="text-xs text-blue-600 font-semibold mt-1">Perfil: Aluno (Student)</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Professores & Admins</p>
                <p className="text-3xl font-black text-gray-900 mt-2">
                  {(stats?.roleCounts.professor || 0) + (stats?.roleCounts.admin || 0)}
                </p>
                <p className="text-xs text-emerald-600 font-semibold mt-1">Gestão de Conteúdo</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <BarChart3 size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Total de Inscrições</p>
                <p className="text-3xl font-black text-gray-900 mt-2">
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
        <section className="mb-12 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <BarChart3 size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Atividade da plataforma</h2>
              <p className="mt-1 text-sm text-gray-500">Acompanhe a evolução real das matrículas e dos acessos ativos para orientar decisões acadêmicas.</p>
            </div>
          </div>
          <MonthlyActivityChart data={stats?.monthlyActivity || []} />
        </section>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/cursos">
            <div className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition-shadow cursor-pointer">
              <BookOpen className="text-red-600 mb-4" size={40} />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Gerenciar Cursos</h2>
              <p className="text-gray-600">Criar, editar e deletar cursos</p>
            </div>
          </Link>

          <Link href="/admin/materiais">
            <div className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition-shadow cursor-pointer">
              <FileText className="text-blue-600 mb-4" size={40} />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Gerenciar Materiais</h2>
              <p className="text-gray-600">Adicionar e organizar materiais de apoio</p>
            </div>
          </Link>

          <Link href="/admin/artigos">
            <div className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition-shadow cursor-pointer">
              <FileText className="text-green-600 mb-4" size={40} />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Gerenciar Artigos</h2>
              <p className="text-gray-600">Publicar e editar artigos do blog</p>
            </div>
          </Link>

          <Link href="/admin/usuarios">
            <div className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition-shadow cursor-pointer">
              <Users className="text-purple-600 mb-4" size={40} />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Gerenciar Usuários</h2>
              <p className="text-gray-600">Ver, promover e remover usuários</p>
            </div>
          </Link>

          <Link href="/admin/matriculas">
            <div className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition-shadow cursor-pointer">
              <UserPlus className="text-red-600 mb-4" size={40} />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Matrículas</h2>
              <p className="text-gray-600">Vincular ou desvincular alunos de cursos</p>
            </div>
          </Link>

          <Link href="/admin/chamada">
            <div className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition-shadow cursor-pointer">
              <Calendar className="text-emerald-600 mb-4" size={40} />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Chamada Online</h2>
              <p className="text-gray-600">Registrar frequência e sessões de aula</p>
            </div>
          </Link>

          <Link href="/admin/relatorios">
            <div className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition-shadow cursor-pointer">
              <BarChart3 className="text-orange-600 mb-4" size={40} />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Relatórios</h2>
              <p className="text-gray-600">Estatísticas e progresso dos alunos</p>
            </div>
          </Link>

          <Link href="/admin/mensagens">
            <div className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition-shadow cursor-pointer">
              <Mail className="text-red-600 mb-4" size={40} />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Mensagens de Contato</h2>
              <p className="text-gray-600">Visualizar mensagens enviadas pelo site</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
